package backend.ProdutosDuNego.listener;

import backend.ProdutosDuNego.model.UsuarioModel;
import backend.ProdutosDuNego.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class AuthenticationSuccessListener implements ApplicationListener<AuthenticationSuccessEvent> {

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Este método é chamado automaticamente pelo Spring toda vez
     * que um usuário se autentica com sucesso.
     *
     * @param event O evento de sucesso de autenticação.
     */
    @Override
    public void onApplicationEvent(AuthenticationSuccessEvent event) {
        // Pega o usuário que acabou de logar a partir do evento
        UsuarioModel usuario = (UsuarioModel) event.getAuthentication().getPrincipal();

        usuario.setUltimoLogin(LocalDateTime.now());

        usuarioRepository.save(usuario);
    }
}