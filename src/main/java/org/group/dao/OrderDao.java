package org.group.dao;

import org.group.entity.Order;

import java.util.List;

public interface OrderDao {
	public void createTable();
    public Order createOrder(Order order);
    public void updateOrder(Order order);
    public void deleteOrder(String username);
    public Order findByName(String username);
   // public List<Order>  findAllOrder() ;
}