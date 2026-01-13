package backend.ProdutosDuNego.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.boot.autoconfigure.security.servlet.PathRequest.toH2Console;

@Configuration
@Profile("desenvolvimento") // Esta classe só é ativada quando o perfil é "desenvolvimento"
public class DevSecurityConfig {

    @Bean
    @Order(1) // Garante que esta regra seja processada primeiro
    public SecurityFilterChain h2ConsoleSecurityFilterChain(HttpSecurity http) throws Exception {
        http.securityMatcher(toH2Console()) // Aplica esta regra apenas às rotas do H2 console
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll()) // Permite tudo
                .csrf(csrf -> csrf.disable()) // Desabilita CSRF para o H2
                .headers(headers -> headers.frameOptions(frame -> frame.disable())); // Desabilita X-Frame-Options para o H2
        return http.build();
    }
}