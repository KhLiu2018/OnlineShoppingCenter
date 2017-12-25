package org.group.dao;

/**
 * Created by lincolnz9511 on 16-11-26.
 */

import org.group.entity.User;

public interface UserDao {
    public void createTable();
    public User createUser(User user);
    public void updateUser(User user);
    public void deleteUser(String username);
    public User findByName(String username);
}
