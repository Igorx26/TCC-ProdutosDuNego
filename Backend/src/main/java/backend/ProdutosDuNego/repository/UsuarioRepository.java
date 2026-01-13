package backend.ProdutosDuNego.repository;

import backend.ProdutosDuNego.model.UsuarioModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<UsuarioModel, Long> {

    // Métodos para verificar se já existe um usuário com estes dados
    Optional<UsuarioModel> findByNomeUsuario(String nomeUsuario);
    Optional<UsuarioModel> findByEmail(String email);
    Optional<UsuarioModel> findByCpf(String cpf);

    // Busca um usuário pelo username OU email OU cpf.
    Optional<UsuarioModel> findByNomeUsuarioOrCpf(String nomeUsuario, String cpf);
}