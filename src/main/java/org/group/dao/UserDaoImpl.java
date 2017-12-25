package org.group.dao;

import org.group.entity.User;
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
public class UserDaoImpl implements UserDao {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void createTable() {
        String sql = "CREATE TABLE  if not exists users (username varchar(100) NOT NULL,password varchar(100) NOT NULL,"
                + "account double NOT NULL,vip varchar(100) NOT NULL,PRIMARY KEY(username))ENGINE=InnoDB CHARSET=utf8";
        jdbcTemplate.update(sql);
    }
    public User createUser(final User user) {
        final String sql = "insert into users(username, password, account,vip) values(?,?,?,?)";
        // ？？ execute
        jdbcTemplate.update(sql, user.getUsername(), user.getPassword(), user.getAccount(), user.getVip());
        return user;
    }

    public void updateUser(User user) {
        String sql = "update users set username=?, password=?, account=?,vip=?  where username=?";
        jdbcTemplate.update(sql, user.getUsername(), user.getPassword(), user.getAccount(), user.getVip(),user.getUsername());
    }

    public void deleteUser(String username) {
        String sql = "delete from users where username=?";
        jdbcTemplate.update(sql, username);
    }

    @Cacheable(value="MyCache", key="#username", unless="#result == null")
    public User findByName(String username) {
        String sql = "select username, password, account, vip from users where username=?";
        List<User> userList = jdbcTemplate.query(sql, new BeanPropertyRowMapper(User.class), username);
        if(userList.size() == 0) {
            return null;
        }
        return userList.get(0);
    }
}
