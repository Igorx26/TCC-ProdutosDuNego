package backend.ProdutosDuNego.config;

import backend.ProdutosDuNego.exception.StandardError;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private SecurityFilter securityFilter;

    @Autowired
    private ObjectMapper objectMapper;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // =================================================================
                        // ENDPOINTS PÚBLICOS
                        // =================================================================
                        .requestMatchers(HttpMethod.POST, "/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/usuario/salvar").permitAll()
                        .requestMatchers(HttpMethod.POST, "/usuario/salvarComEndereco").permitAll()
                        .requestMatchers(HttpMethod.GET, "/produto/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/categoria/**").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                        // =================================================================
                        // ENDPOINTS DE ADMIN (REGRAS ESPECÍFICAS PRIMEIRO)
                        // =================================================================
                        .requestMatchers("/fornecedor/**", "/compra/**", "/status/**", "/medida/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/produto/**", "/categoria/**","/formaPagamento").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/produto/**", "/categoria/**","/formaPagamento").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/produto/**", "/categoria/**","/formaPagamento").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/produto/**", "/categoria/**","/formaPagamento").hasRole("ADMIN")
                        .requestMatchers("/usuario/obterTodos", "/usuario/reativar/**").hasRole("ADMIN")
                        .requestMatchers("/relatorios/**").permitAll()

                        // Regras específicas de Venda para ADMIN
                        .requestMatchers(HttpMethod.GET, "/venda/obterTodas").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/venda/confirmarSeparacao/**",
                                "/venda/confirmarEntrega/**",
                                "/venda/confirmarPagamento/**",
                                "/venda/aplicarAjustes/**").hasRole("ADMIN")

                        // =================================================================
                        // ENDPOINTS DE USUÁRIO LOGADO (REGRAS MAIS GERAIS)
                        // =================================================================
                        // Qualquer outra requisição não listada acima exige autenticação.
                        // Isso cobre um usuário gerenciando seu próprio perfil, seus endereços,
                        // fazendo um pedido e cancelando um pedido.
                        .requestMatchers(HttpMethod.POST, "/venda/salvar").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            // Crie o erro usando sua classe padrão
                            StandardError err = new StandardError(
                                    System.currentTimeMillis(),
                                    HttpServletResponse.SC_UNAUTHORIZED, // 401
                                    "Não autorizado",
                                    "Token JWT inválido, expirado ou ausente. É necessário autenticação para acessar este recurso.",
                                    request.getRequestURI());

                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.setCharacterEncoding("UTF-8");

                            // Use o ObjectMapper para converter o objeto em JSON
                            response.getWriter().write(objectMapper.writeValueAsString(err));
                        })
                );
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}