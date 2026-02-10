package com.example.demo.common.config.auth; // 패키지 경로는 프로젝트에 맞게 수정해!

import java.util.ArrayList;
import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.demo.employee.model.entity.Employee;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor // 💡 final이 붙은 필드만 모아서 생성자를 자동으로 만들어줘!
public class PrincipalDetails implements UserDetails {

    private final Employee employee; // 💡 final을 붙여서 "이 데이터는 절대 변하지 않아"라고 명시

    // 직접 만든 생성자는 지워도 돼! 롬복이 대신 만들어주거든.

    @Override
    public String getPassword() {
        return employee.getEmpPw();
    }

	// --- 아래는 계정 상태 체크 (기본값 true) ---
	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
	    Collection<GrantedAuthority> collect = new ArrayList<>();
	    
	    // 💡 사원의 roleLevel을 가져와서 "ROLE_2" 같은 형태로 권한을 부여함
	    collect.add(new GrantedAuthority() {
	        @Override
	        public String getAuthority() {
	            // "ROLE_" 접두사를 붙이는 것이 스프링 시큐리티의 관습이야!
	            return "ROLE_" + employee.getAuthorityLevel();
	        }
	    });
	    
	    return collect;
	}

	@Override
	public String getUsername() {
	    // 💡 시큐리티야, 우리 회사에서는 '사번'을 아이디(식별자)로 써!
	    return employee.getEmpNo(); 
	}
}
