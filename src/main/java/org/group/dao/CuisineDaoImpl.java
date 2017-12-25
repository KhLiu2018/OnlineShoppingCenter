package org.group.dao;

import org.group.entity.Cuisine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
/**
 * Created by lincolnz9511 on 16-11-26.
 */
@Repository
@Component
public class CuisineDaoImpl  implements CuisineDao {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    public void createTable() {
        String sql = "CREATE TABLE  if not exists cuisines (cuisine_name varchar(100) NOT NULL,description varchar(500) NOT NULL,"
                + "price DOUBLE NOT NULL,city varchar(100) NOT NULL,PRIMARY KEY(cuisine_name))ENGINE=InnoDB CHARSET=utf8";
        jdbcTemplate.update(sql);
    }

    public Cuisine createCuisine(final Cuisine cuisine) {
        final String sql
                = "insert into cuisines(cuisine_name, description, price,city) values(?,?,?,?)";
        jdbcTemplate.update(sql, cuisine.getCuisine_name(),cuisine.getDescription(),cuisine.getPrice(),cuisine.getCity());
        return cuisine;
    }

    public void updateCuisine(Cuisine cuisine) {
        String sql = "update cuisines set cuisine_name=?, description=?, price=?, city=?  where cuisine_name=?";
        jdbcTemplate.update(sql, cuisine.getCuisine_name(),cuisine.getDescription(),cuisine.getPrice(), cuisine.getCity(),cuisine.getCuisine_name());
    }

    public void deleteCuisine(String cuisine_name) {
        String sql = "delete from cuisines where cuisine_name=?";
        jdbcTemplate.update(sql, cuisine_name);
    }

    public Cuisine findByName(String cuisine_name) {
        String sql = "select cuisine_name, description, price, city  from cuisines where cuisine_name=?";
        List<Cuisine> userList = jdbcTemplate.query(sql, new BeanPropertyRowMapper(Cuisine.class), cuisine_name);
        if(userList.size() == 0) {
            return null;
        }
        return userList.get(0);
    }

    @Cacheable(value="MyCache", key="#city",unless="#result == null")
    public List<Cuisine>  findAllCuisine(String city) {
    	String sql = "select cuisine_name, description, price, city from cuisines";
    	 List<Cuisine> CuisineList = jdbcTemplate.query(sql, new BeanPropertyRowMapper(Cuisine.class));
    	 if (CuisineList.size() == 0)
    		 return null;
    	 else {
             List<Cuisine> want = new ArrayList<Cuisine>();
             for (Cuisine c: CuisineList) {
                 if (c.getCity().equals(city)) {
                     want.add(c);
                 }
             }
             List<Cuisine> rwant = new ArrayList<Cuisine>();
             for (int i = want.size()-1; i >= 0; --i) {
                 rwant.add(want.get(i));
             }
             return rwant;
         }
    }
}
