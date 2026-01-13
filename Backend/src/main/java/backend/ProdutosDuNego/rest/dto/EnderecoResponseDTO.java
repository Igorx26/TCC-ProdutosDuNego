package backend.ProdutosDuNego.rest.dto;

public record EnderecoResponseDTO(
        Long id,
        String logradouro,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String uf,
        String cep,
        boolean isPrincipal
) {}