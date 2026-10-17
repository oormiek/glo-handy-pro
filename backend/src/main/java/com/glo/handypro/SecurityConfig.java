
package com.glo.handypro;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.core.env.Environment;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(
            PasswordEncoder passwordEncoder,
            @Value("${ADMIN_USERNAME:}") String username,
            @Value("${ADMIN_PASSWORD:}") String password) {

        if (username.isBlank() || password.isBlank()) {
            throw new IllegalStateException(
                "Set ADMIN_USERNAME and ADMIN_PASSWORD before starting the backend."
            );
        }

        return new InMemoryUserDetailsManager(
            User.withUsername(username)
                .password(passwordEncoder.encode(password))
                .roles("ADMIN")
                .build()
        );
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            Environment environment) {
        CorsConfiguration configuration = new CorsConfiguration();

        String allowedOrigins = environment.getProperty(
            "CORS_ALLOWED_ORIGINS",
            "http://localhost:5173"
        );

        configuration.setAllowedOrigins(
            Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList()
        );

        configuration.setAllowedMethods(
            List.of("GET", "POST", "PATCH", "OPTIONS")
        );

        configuration.setAllowedHeaders(
            List.of("Authorization", "Content-Type", "X-Integration-Secret")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/health").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/quotes").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().denyAll()
            )
            .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}
