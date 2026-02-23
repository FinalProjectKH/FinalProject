package com.example.demo.common.config.auth;

import java.util.ArrayList;
import java.util.Collection;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import com.example.demo.employee.model.entity.Employee;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
public class PrincipalDetails implements UserDetails {

    private final Employee employee;

    // 💡 운영 환경에서는 명시적 생성자가 디버깅과 안정성 면에서 더 유리해.
    public PrincipalDetails(Employee employee) {
        this.employee = employee;
    }

    @Override
    public String getUsername() {
        // 💡 실사용 시 employee가 유실되어도 서버가 NPE로 죽지 않게 방어
        return (employee != null) ? employee.getEmpNo() : "anonymous";
    }

    @Override
    public String getPassword() {
        return (employee != null) ? employee.getEmpPw() : null;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Collection<GrantedAuthority> collect = new ArrayList<>();
        if (employee != null) {
            collect.add(() -> "ROLE_" + employee.getAuthorityLevel());
        }
        return collect;
    }

    // 계정 활성화 상태 (운영 환경에선 DB의 DEL_FL과 연동하면 더 좋아)
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { 
        return employee != null && "N".equals(employee.getEmpDelFl()); 
    }
}