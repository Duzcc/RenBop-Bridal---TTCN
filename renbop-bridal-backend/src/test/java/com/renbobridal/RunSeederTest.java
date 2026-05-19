package com.renbobridal;

import com.renbobridal.config.DatabaseSeeder;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class RunSeederTest {

    @Autowired
    private DatabaseSeeder databaseSeeder;

    @Test
    public void executeSeeder() throws Exception {
        System.out.println("====== ĐANG KÍCH HOẠT BỘ CẤY DỮ LIỆU LUXURY ======");
        databaseSeeder.run();
        System.out.println("====== HOÀN TẤT BƠM DỮ LIỆU ======");
    }
}
