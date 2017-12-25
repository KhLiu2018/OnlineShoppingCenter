package org.group.realm;

import org.apache.shiro.authc.*;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.authz.SimpleAuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.subject.PrincipalCollection;
import org.apache.shiro.util.ByteSource;
import org.group.dao.UserDaoImpl;
import org.group.entity.User;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Set;
/**
 * Created by lincolnz9511 on 16-11-26.
 */

public class UserRealm extends AuthorizingRealm {
    // Marks a constructor, field, setter method or config method as to be autowired by Spring's dependency injection facilities.
    @Autowired
    private UserDaoImpl userService;

    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals) {
        String username = (String)principals.getPrimaryPrincipal();
        Set<String> roles = null,perms = null;
        perms.add("user:buy");
        roles.add(userService.findByName(username).getVip());
        SimpleAuthorizationInfo authorizationInfo = new SimpleAuthorizationInfo();
        authorizationInfo.setRoles(roles);
        authorizationInfo.setStringPermissions(perms);
        System.out.println("roles: "+ roles);
        System.out.println("perms: "+ perms);
        return authorizationInfo;
    }

    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) throws AuthenticationException {

        String username = (String)token.getPrincipal();

        User user = userService.findByName(username);

        if(user == null) {
            throw new UnknownAccountException();
        }

        return new SimpleAuthenticationInfo(username, user.getPassword(), ByteSource.Util.bytes(username), getName());
    }

    @Override
    public void clearCachedAuthorizationInfo(PrincipalCollection principals) {
        super.clearCachedAuthorizationInfo(principals);
    }

    @Override
    public void clearCachedAuthenticationInfo(PrincipalCollection principals) {
        super.clearCachedAuthenticationInfo(principals);
    }

    @Override
    public void clearCache(PrincipalCollection principals) {
        super.clearCache(principals);
    }

    public void clearAllCachedAuthorizationInfo() {
        getAuthorizationCache().clear();
    }

    public void clearAllCachedAuthenticationInfo() {
        getAuthenticationCache().clear();
    }

    public void clearAllCache() {
        clearAllCachedAuthenticationInfo();
        clearAllCachedAuthorizationInfo();
    }
}
