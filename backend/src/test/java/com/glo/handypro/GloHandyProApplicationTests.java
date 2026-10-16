
package com.glo.handypro;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "ADMIN_PASSWORD=test-only-password",
    "ADMIN_USERNAME=test-admin"
})
class GloHandyProApplicationTests {

    @Test
    void contextLoads() {
    }

}
