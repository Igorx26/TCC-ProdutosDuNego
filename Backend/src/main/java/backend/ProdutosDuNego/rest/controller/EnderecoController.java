package backend.ProdutosDuNego.rest.controller;

import backend.ProdutosDuNego.rest.dto.EnderecoDTO;
import backend.ProdutosDuNego.rest.dto.EnderecoResponseDTO;
import backend.ProdutosDuNego.service.EnderecoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/endereco")
public class EnderecoController {

    private final EnderecoService enderecoService;

    @Autowired
    public EnderecoController(EnderecoService enderecoService) {
        this.enderecoService = enderecoService;
    }

    /**
     * Endpoint para atualizar os dados de um endereço físico.
     * Esta rota é separada porque a alteração dos dados de um endereço (ex: corrigir um CEP)
     * é uma ação sobre o recurso "Endereço", e não sobre o "Endereço de um Usuário".
     * URL: PUT /enderecos/10 (onde 10 é o ID do ENDEREÇO)
     */
    @PutMapping("/{id}")
    public ResponseEntity<EnderecoResponseDTO> atualizarEndereco(@PathVariable Long id, @Valid @RequestBody EnderecoDTO dto) {
        EnderecoResponseDTO enderecoAtualizado = enderecoService.atualizarEndereco(id, dto);
        return ResponseEntity.ok(enderecoAtualizado);
    }
}