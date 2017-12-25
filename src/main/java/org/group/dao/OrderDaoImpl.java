package org.group.dao;

import org.group.entity.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import java.util.List;
/**
 * Created by lincolnz9511 on 16-11-26.
 */
@Repository
@Component
public class OrderDaoImpl  implements OrderDao {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void createTable() {
        String sql = "CREATE TABLE  if not exists orders (username varchar(100) NOT NULL,cuisine_name varchar(100) NOT NULL,"
                + "number INT NOT NULL,PRIMARY KEY(username))ENGINE=InnoDB CHARSET=utf8";
        jdbcTemplate.update(sql);
    }
    
    public Order createOrder(final Order order) {
        final String sql
                = "insert into Orders(username, cuisine_name, number) values(?,?,?)";
        jdbcTemplate.update(sql, order.getUsername(),order.getCuisine_name(),order.getNumber());
        return order;
    }

    public void updateOrder(Order order) {
        String sql = "update orders set username=?, cuisine_name=?, number=?  where username=?";
        jdbcTemplate.update(sql, order.getUsername(),order.getCuisine_name(),order.getNumber(), order.getUsername());
    }

    public void deleteOrder(String username) {
        String sql = "delete from orders where username=?";
        jdbcTemplate.update(sql, username);
    }
    @Cacheable(value="MyCache", unless="#result == null")
    public Order findByName(String username) {
        String sql = "select username, cuisine_name, number from orders where username=?";
        List<Order> userList = jdbcTemplate.query(sql, new BeanPropertyRowMapper(Order.class), username);
        if(userList.size() == 0) {
            return null;
        }
        return userList.get(0);
    }
}

