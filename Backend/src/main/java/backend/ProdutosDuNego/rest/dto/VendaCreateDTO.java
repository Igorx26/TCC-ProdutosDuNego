package backend.ProdutosDuNego.rest.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record VendaCreateDTO(
        @NotNull(message = "O ID do endereço do usuário é obrigatório")
        Long idUsuarioEndereco,

        @NotNull(message = "O ID da forma de pagamento é obrigatório")
        Long idFormaPagamento,

        String observacaoCliente,

        @FutureOrPresent(message = "A data para entrega não pode ser no passado.")
        LocalDate dataParaEntrega,

        LocalTime horaParaEntrega,

        @NotEmpty(message = "O pedido deve conter pelo menos um item.")
        @Valid
        List<VendaItemDTO> itens
) {}