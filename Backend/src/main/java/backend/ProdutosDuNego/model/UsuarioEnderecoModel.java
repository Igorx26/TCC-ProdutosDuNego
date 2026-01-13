package backend.ProdutosDuNego.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "UsuarioEndereco")
public class UsuarioEnderecoModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "usuend_id")
    private Long id;

    @Column(name = "usuend_principal", nullable = false)
    private boolean isPrincipal = false;

    @Column(name = "usuend_ativo", nullable = false)
    private boolean isAtivo = true;

    @Column(name = "usu_id", nullable = false)
    private Long idUsuario;

    @Column(name = "end_id", nullable = false)
    private Long idEndereco;
}