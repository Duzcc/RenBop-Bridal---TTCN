package com.renbobridal;

import com.renbobridal.module.auth.entity.User;
import com.renbobridal.module.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

@SpringBootTest
public class UpdateRoleTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    public void promoteToAdmin() {
        Optional<User> userOpt = userRepository.findByEmail("admin@renbop.com");
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setRole(User.Role.ADMIN);
            userRepository.save(user);
            System.out.println("====== SUCCESS: Tài khoản admin@renbop.com đã được thăng cấp lên ADMIN! ======");
        } else {
            System.out.println("====== ERROR: Không tìm thấy tài khoản admin@renbop.com. Vui lòng kiểm tra lại xem bạn đã đăng ký chưa. ======");
        }
    }
}
