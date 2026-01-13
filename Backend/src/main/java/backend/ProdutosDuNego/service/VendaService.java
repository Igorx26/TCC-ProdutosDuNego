package backend.ProdutosDuNego.service;

import backend.ProdutosDuNego.exception.BusinessRuleException;
import backend.ProdutosDuNego.exception.ObjectNotFoundException;
import backend.ProdutosDuNego.model.*;
import backend.ProdutosDuNego.repository.*;
import backend.ProdutosDuNego.rest.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class VendaService {

    private final VendaRepository vendaRepository;
    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioEnderecoRepository usuarioEnderecoRepository;
    private final FormaPagamentoRepository formaPagamentoRepository;
    private final StatusRepository statusRepository;
    private final EnderecoRepository enderecoRepository;
    private final SecurityService securityService;

    @Autowired
    public VendaService(VendaRepository vendaRepository, ProdutoRepository produtoRepository, UsuarioRepository usuarioRepository, UsuarioEnderecoRepository usuarioEnderecoRepository, FormaPagamentoRepository formaPagamentoRepository, StatusRepository statusRepository,  EnderecoRepository enderecoRepository, SecurityService securityService) {
        this.vendaRepository = vendaRepository;
        this.produtoRepository = produtoRepository;
        this.usuarioRepository = usuarioRepository;
        this.usuarioEnderecoRepository = usuarioEnderecoRepository;
        this.formaPagamentoRepository = formaPagamentoRepository;
        this.statusRepository = statusRepository;
        this.enderecoRepository = enderecoRepository;
        this.securityService = securityService;

    }

    String emAberto = "Em Aberto";
    String separado = "Separado";
    String entregue = "Entregue, aguardando pagamento";
    String pago = "Pago, aguardando entrega";
    String concluido = "Concluído";
    String cancelado = "Cancelado";

    /**
     * Lista todas as vendas do sistema. Permite filtrar por status. (Para o ADMIN)
     * @param nomeStatus Opcional. A descrição do status para filtrar.
     * @return Uma lista de vendas enriquecida.
     */
    @Transactional(readOnly = true)
    public List<VendaResponseDTO> obterTodas(String nomeStatus) {
        List<VendaModel> vendas;
        if (nomeStatus != null && !nomeStatus.isBlank()) {
            StatusModel status = statusRepository.findByDescricao(nomeStatus)
                    .orElseThrow(() -> new ObjectNotFoundException("Status não encontrado: " + nomeStatus));
            vendas = vendaRepository.findByIdStatus(status.getId());
        } else {
            vendas = vendaRepository.findAll();
        }
        return enriquecerVendas(vendas);
    }

    /**
     * Lista todas as vendas do cliente logado.
     * @return O histórico de pedidos do cliente.
     */
    @Transactional(readOnly = true)
    public List<VendaResponseDTO> obterMinhasVendas() {
        UsuarioModel clienteLogado = securityService.getAuthenticatedUser();
        Long clienteId = clienteLogado.getId();

        List<UsuarioEnderecoModel> ligacoesDeEndereco = usuarioEnderecoRepository.findByIdUsuario(clienteId);
        if (ligacoesDeEndereco.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> idsUsuarioEndereco = ligacoesDeEndereco.stream()
                .map(UsuarioEnderecoModel::getId)
                .collect(Collectors.toList());

        List<VendaModel> vendas = vendaRepository.findByIdUsuarioEnderecoIn(idsUsuarioEndereco);

        // Chama o método helper otimizado para enriquecer os dados
        return enriquecerVendas(vendas);
    }

    /**
     * Método privado que recebe uma lista de VendaModel e a enriquece com todos os
     * dados relacionados (cliente, endereço, status, itens) de forma otimizada.
     */
    private List<VendaResponseDTO> enriquecerVendas(List<VendaModel> vendas) {
        if (vendas.isEmpty()) {
            return Collections.emptyList();
        }

        // 1. Coleta todos os IDs necessários
        List<Long> idsStatus = vendas.stream().map(VendaModel::getIdStatus).distinct().collect(Collectors.toList());
        List<Long> idsUsuarioEndereco = vendas.stream().map(VendaModel::getIdUsuarioEndereco).distinct().collect(Collectors.toList());
        // --- LÓGICA ADICIONADA ---
        List<Long> idsFormaPagamento = vendas.stream().map(VendaModel::getIdFormaPagamento).distinct().collect(Collectors.toList());

        List<UsuarioEnderecoModel> ligacoes = usuarioEnderecoRepository.findAllById(idsUsuarioEndereco);
        List<Long> idsUsuarios = ligacoes.stream().map(UsuarioEnderecoModel::getIdUsuario).distinct().collect(Collectors.toList());
        List<Long> idsEnderecos = ligacoes.stream().map(UsuarioEnderecoModel::getIdEndereco).distinct().collect(Collectors.toList());

        List<Long> idsProdutos = vendas.stream()
                .flatMap(venda -> venda.getItens().stream())
                .map(VendaItemModel::getIdProduto)
                .distinct().collect(Collectors.toList());

        // 2. Busca todos os dados relacionados em poucas queries
        Map<Long, StatusModel> mapaStatus = statusRepository.findAllById(idsStatus).stream().collect(Collectors.toMap(StatusModel::getId, s -> s));
        Map<Long, UsuarioModel> mapaUsuarios = usuarioRepository.findAllById(idsUsuarios).stream().collect(Collectors.toMap(UsuarioModel::getId, u -> u));
        Map<Long, EnderecoModel> mapaEnderecos = enderecoRepository.findAllById(idsEnderecos).stream().collect(Collectors.toMap(EnderecoModel::getId, e -> e));
        Map<Long, ProdutoModel> mapaProdutos = produtoRepository.findAllById(idsProdutos).stream().collect(Collectors.toMap(ProdutoModel::getId, p -> p));
        Map<Long, UsuarioEnderecoModel> mapaLigacoes = ligacoes.stream().collect(Collectors.toMap(UsuarioEnderecoModel::getId, l -> l));
        // --- LÓGICA ADICIONADA ---
        Map<Long, FormaPagamentoModel> mapaFormaPagamento = formaPagamentoRepository.findAllById(idsFormaPagamento).stream().collect(Collectors.toMap(FormaPagamentoModel::getId, fp -> fp));


        // 3. Monta o DTO de Resposta
        return vendas.stream().map(venda -> {
            StatusModel status = mapaStatus.get(venda.getIdStatus());
            UsuarioEnderecoModel ligacao = mapaLigacoes.get(venda.getIdUsuarioEndereco());
            FormaPagamentoModel formaPagamento = mapaFormaPagamento.get(venda.getIdFormaPagamento());

            // Dados do cliente e endereço (pode ser nulo se a ligação não for encontrada)
            UsuarioModel cliente = (ligacao != null) ? mapaUsuarios.get(ligacao.getIdUsuario()) : null;
            EnderecoModel endereco = (ligacao != null) ? mapaEnderecos.get(ligacao.getIdEndereco()) : null;
            String nomeCliente = (cliente != null) ? cliente.getNome() + " " + cliente.getSobrenome() : "N/A";

            EnderecoResponseDTO enderecoDTO = null;
            if (ligacao != null && endereco != null) {
                enderecoDTO = new EnderecoResponseDTO(ligacao.getId(), endereco.getLogradouro(), endereco.getNumero(), endereco.getComplemento(), endereco.getBairro(), endereco.getCidade(), endereco.getUf().name(), endereco.getCep(), ligacao.isPrincipal());
            }

            // Mapeia os itens da venda
            List<VendaItemResponseDTO> itensDto = venda.getItens().stream().map(item -> {
                ProdutoModel produto = mapaProdutos.getOrDefault(item.getIdProduto(), null);
                String nomeProduto = (produto != null) ? produto.getNome() : "Produto Excluído";
                return new VendaItemResponseDTO(item.getIdProduto(), nomeProduto, item.getQuantidade(), item.getValor(), item.getValor().multiply(item.getQuantidade()));
            }).collect(Collectors.toList());

            // --- LÓGICA ADICIONADA ---
            FormaPagamentoDTO formaPagamentoDTO = (formaPagamento != null)
                    ? new FormaPagamentoDTO(formaPagamento.getId(), formaPagamento.getDescricao(), formaPagamento.isAtivo())
                    : null;

            return new VendaResponseDTO(
                    venda.getId(),
                    venda.getDataHora(),
                    status.getDescricao(),
                    venda.getTotalBruto(),
                    venda.getDesconto(),
                    venda.getAcrescimo(),
                    venda.getTotalLiquido(),
                    nomeCliente,
                    enderecoDTO,
                    itensDto,
                    formaPagamentoDTO // <-- Adiciona o DTO da forma de pagamento
            );

        }).collect(Collectors.toList());
    }

    /**
     * Processa e salva uma nova venda, validando estoque e atualizando as quantidades.
     * @param usuarioId ID do usuário autenticado que está realizando a compra.
     * @param dto DTO com os dados do pedido.
     * @return DTO com os detalhes da venda criada.
     */
    @Transactional
    public VendaResponseDTO realizarVenda(Long usuarioId, VendaCreateDTO dto) {
        // --- 1. Validação dos Dados de Entrada ---
        UsuarioModel cliente = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ObjectNotFoundException("Cliente não encontrado com o ID: " + usuarioId));

        UsuarioEnderecoModel usuarioEndereco = usuarioEnderecoRepository.findById(dto.idUsuarioEndereco())
                .orElseThrow(() -> new ObjectNotFoundException("Endereço não encontrado com o ID: " + dto.idUsuarioEndereco()));

        // Validação de segurança: garante que o endereço pertence ao cliente
        if (!usuarioEndereco.getIdUsuario().equals(cliente.getId())) {
            throw new BusinessRuleException("O endereço selecionado não pertence ao cliente autenticado.");
        }

        if (dto.dataParaEntrega() != null && dto.horaParaEntrega() != null) {
            LocalDateTime dataHoraEntregaDesejada = LocalDateTime.of(dto.dataParaEntrega(), dto.horaParaEntrega());
            if (dataHoraEntregaDesejada.isBefore(LocalDateTime.now().plusHours(2))) {
                throw new BusinessRuleException("A data e hora para entrega deve ter no mínimo 2 horas de antecedência.");
            }
        }

        formaPagamentoRepository.findById(dto.idFormaPagamento())
                .orElseThrow(() -> new ObjectNotFoundException("Forma de pagamento não encontrada com o ID: " + dto.idFormaPagamento()));

        StatusModel statusInicial = statusRepository.findByDescricao(emAberto)
                .orElseThrow(() -> new BusinessRuleException("Status inicial 'Em Aberto' não foi encontrado no sistema."));

        // --- 2. Processamento dos Itens com Travamento de Estoque ---
        VendaModel novaVenda = new VendaModel();
        novaVenda.setIdUsuarioEndereco(usuarioEndereco.getId());
        novaVenda.setIdFormaPagamento(dto.idFormaPagamento());
        novaVenda.setIdStatus(statusInicial.getId());
        novaVenda.setObservacaoCliente(dto.observacaoCliente());
        novaVenda.setDataParaEntrega(dto.dataParaEntrega());
        novaVenda.setHoraParaEntrega(dto.horaParaEntrega());

        BigDecimal totalBruto = BigDecimal.ZERO;
        List<VendaItemModel> itensDaVenda = new ArrayList<>();

        for (VendaItemDTO itemDto : dto.itens()) {
            // Usando o findById com lock para garantir a consistência do estoque
            ProdutoModel produto = produtoRepository.findById(itemDto.idProduto())
                    .orElseThrow(() -> new ObjectNotFoundException("Produto não encontrado com o ID: " + itemDto.idProduto()));

            if (!produto.isAtivo()) {
                throw new BusinessRuleException("O produto '" + produto.getNome() + "' não está ativo para venda.");
            }
            if (produto.getEstoque().compareTo(itemDto.quantidade()) < 0) {
                throw new BusinessRuleException("Estoque insuficiente para o produto: " + produto.getNome());
            }

            produto.setEstoque(produto.getEstoque().subtract(itemDto.quantidade()));

            VendaItemModel itemVenda = new VendaItemModel();
            itemVenda.setIdProduto(produto.getId());
            itemVenda.setQuantidade(itemDto.quantidade());
            itemVenda.setValor(produto.getValor());
            itemVenda.setVenda(novaVenda);

            itensDaVenda.add(itemVenda);
            totalBruto = totalBruto.add(itemVenda.getValor().multiply(itemVenda.getQuantidade()));
        }

        // --- 3. Finalização e Persistência ---
        novaVenda.setItens(itensDaVenda);
        novaVenda.setTotalBruto(totalBruto);
        novaVenda.setTotalLiquido(totalBruto);

        VendaModel vendaSalva = vendaRepository.save(novaVenda);

        return enriquecerVendas(Collections.singletonList(vendaSalva)).get(0);
    }

    /**
     * Altera o status de uma venda para 'SEPARADO'.
     * Conforme o caso de uso "Concluir venda - Administrador".
     * @param vendaId O ID da venda a ter o status alterado.
     */
    @Transactional
    public void confirmarSeparacao(Long vendaId) {
        // 1. Busca a venda no banco
        VendaModel venda = vendaRepository.findById(vendaId)
                .orElseThrow(() -> new ObjectNotFoundException("Venda não encontrada! Id: " + vendaId));

        // 2. Busca o status atual e o novo status
        StatusModel statusAtual = statusRepository.findById(venda.getIdStatus())
                .orElseThrow(() -> new ObjectNotFoundException("Status atual da venda não encontrado."));

        // 3. Regra de Negócio: Garante que a ação só pode ser feita em um pedido emAberto
        if (!emAberto.equalsIgnoreCase(statusAtual.getDescricao())) {
            throw new BusinessRuleException("O pedido só pode ser separado se o status atual for 'EM ABERTO'.");
        }

        // 4. Busca o status separado que deve existir no banco
        StatusModel statusSeparado = statusRepository.findByDescricao(separado)
                .orElseThrow(() -> new BusinessRuleException("Status 'SEPARADO' não foi encontrado no sistema. Cadastre-o primeiro."));

        // 5. Atualiza o ID do status na venda e salva
        venda.setIdStatus(statusSeparado.getId());
        vendaRepository.save(venda);
    }

    // Dentro da classe service/VendaService.java

    /**
     * Confirma a entrega de uma venda, atualizando a data de entrega e o status.
     * @param vendaId O ID da venda.
     * @param dataEntrega A data e hora em que a entrega foi efetuada.
     */
    @Transactional
    public void confirmarEntrega(Long vendaId, LocalDateTime dataEntrega) {
        VendaModel venda = vendaRepository.findById(vendaId)
                .orElseThrow(() -> new ObjectNotFoundException("Venda não encontrada! Id: " + vendaId));

        StatusModel statusAtual = statusRepository.findById(venda.getIdStatus())
                .orElseThrow(() -> new ObjectNotFoundException("Status da venda não encontrado."));

        // Regra RN04: Ação só é permitida se o status for 'SEPARADO' (ou já 'PAGO')
        if (!separado.equalsIgnoreCase(statusAtual.getDescricao()) && !pago.equalsIgnoreCase(statusAtual.getDescricao())) {
            throw new BusinessRuleException("O pedido só pode ser marcado como entregue se o status for 'SEPARADO' ou 'PAGO'.");
        }

        venda.setDataHoraDaEntrega(dataEntrega);
        atualizarStatusPosConfirmacao(venda);
        vendaRepository.save(venda);
    }

    /**
     * Confirma o pagamento de uma venda, atualizando a data de pagamento e o status.
     * @param vendaId O ID da venda.
     * @param dataPagamento A data e hora em que o pagamento foi efetuado.
     */
    @Transactional
    public void confirmarPagamento(Long vendaId, LocalDateTime dataPagamento) {
        VendaModel venda = vendaRepository.findById(vendaId)
                .orElseThrow(() -> new ObjectNotFoundException("Venda não encontrada! Id: " + vendaId));

        StatusModel statusAtual = statusRepository.findById(venda.getIdStatus())
                .orElseThrow(() -> new ObjectNotFoundException("Status da venda não encontrado."));

        // Regra RN04: Ação só é permitida se o status for 'SEPARADO' (ou já 'ENTREGUE')
        if (!separado.equalsIgnoreCase(statusAtual.getDescricao()) && !entregue.equalsIgnoreCase(statusAtual.getDescricao())) {
            throw new BusinessRuleException("O pedido só pode ser marcado como pago se o status for 'SEPARADO' ou 'ENTREGUE'.");
        }

        venda.setDataHoraPagamento(dataPagamento);
        atualizarStatusPosConfirmacao(venda);
        vendaRepository.save(venda);
    }
    /**
     * Aplica descontos ou acréscimos a uma venda existente e recalcula o total líquido.
     * @param vendaId O ID da venda a ser ajustada.
     * @param dto DTO com os valores de desconto e/ou acréscimo.
     * @return Os detalhes da venda atualizada.
     */
    @Transactional
    public VendaResponseDTO aplicarAjustes(Long vendaId, VendaAjusteDTO dto) {
        // 1. Busca a venda
        VendaModel venda = vendaRepository.findById(vendaId)
                .orElseThrow(() -> new ObjectNotFoundException("Venda não encontrada! Id: " + vendaId));

        // 2. AQUI ESTÁ A LINHA QUE FALTAVA:
        // Buscamos o status da venda no banco e o guardamos na variável 'statusAtual'.
        StatusModel statusAtual = statusRepository.findById(venda.getIdStatus())
                .orElseThrow(() -> new ObjectNotFoundException("Status da venda não encontrado."));

        // 3. Agora a verificação de segurança pode usar a variável 'statusAtual'
        if (concluido.equalsIgnoreCase(statusAtual.getDescricao()) || cancelado.equalsIgnoreCase(statusAtual.getDescricao())) {
            throw new BusinessRuleException("Não é possível aplicar ajustes em um pedido que já está 'CONCLUÍDO' ou 'CANCELADO'.");
        }

        // 4. Pega os valores do DTO, usando o valor existente se nada for enviado
        BigDecimal desconto = (dto.desconto() != null) ? dto.desconto() : venda.getDesconto();
        BigDecimal acrescimo = (dto.acrescimo() != null) ? dto.acrescimo() : venda.getAcrescimo();

        // 5. Atualiza os campos na entidade
        venda.setDesconto(desconto);
        venda.setObservacaoDesconto(dto.observacaoDesconto());
        venda.setAcrescimo(acrescimo);
        venda.setObservacaoAcrescimo(dto.observacaoAcrescimo());

        // 6. Regra de Negócio: Recalcula o total líquido
        // totalLiquido = totalBruto - desconto + acrescimo
        BigDecimal totalLiquido = venda.getTotalBruto().subtract(desconto).add(acrescimo);
        venda.setTotalLiquido(totalLiquido);

        // 7. Salva a venda atualizada
        VendaModel vendaSalva = vendaRepository.save(venda);

        // 8. Retorna a resposta completa e atualizada
        return enriquecerVendas(Collections.singletonList(vendaSalva)).get(0);
    }
    /**
     * Cancela uma venda, com regras diferentes para Cliente e Administrador.
     * A operação é irreversível e devolve os itens ao estoque.
     * @param vendaId O ID da venda a ser cancelada.
     * @param usuarioLogado O usuário que está realizando a ação.
     */
    @Transactional
    public void cancelarVenda(Long vendaId, UsuarioModel usuarioLogado) {
        // --- 1. Busca dos Dados Essenciais ---
        VendaModel venda = vendaRepository.findById(vendaId)
                .orElseThrow(() -> new ObjectNotFoundException("Venda não encontrada! Id: " + vendaId));

        StatusModel statusAtual = statusRepository.findById(venda.getIdStatus())
                .orElseThrow(() -> new ObjectNotFoundException("Status da venda não encontrado."));

        StatusModel statusCancelado = statusRepository.findByDescricao(cancelado)
                .orElseThrow(() -> new BusinessRuleException("Status 'CANCELADO' não foi encontrado no sistema."));

        // --- 2. Verificação de Segurança (Propriedade)
        // A ação só é permitida se o usuário for ADMIN ou se ele for o dono da venda.
        if (!usuarioLogado.isAdmin()) {
            // Busca a ligação de endereço associada à venda
            UsuarioEnderecoModel ue = usuarioEnderecoRepository.findById(venda.getIdUsuarioEndereco())
                    .orElseThrow(() -> new ObjectNotFoundException("Usuario associado à venda não encontrado."));

            // Compara o ID do usuário da ligação com o ID do usuário logado
            if (!ue.getIdUsuario().equals(usuarioLogado.getId())) {
                throw new BusinessRuleException("Acesso negado. Você só pode cancelar seus próprios pedidos.");
            }
        }

        // --- 3. Aplicação das Regras de Negócio para Cancelamento ---
        // Regra geral: Não pode cancelar um pedido já concluído.
        if (concluido.equalsIgnoreCase(statusAtual.getDescricao()) || cancelado.equalsIgnoreCase(statusAtual.getDescricao())) {
            throw new BusinessRuleException("Este pedido não pode mais ser cancelado.");
        }

        // Regra específica para o Cliente: só pode cancelar se o status for emAberto.
        if (!usuarioLogado.isAdmin() && !emAberto.equalsIgnoreCase(statusAtual.getDescricao())) {
            throw new BusinessRuleException("Como cliente, você só pode cancelar pedidos com o status 'EM ABERTO'.");
        }

        // Lógica de Devolução de Estoque ---
        // Busca todos os produtos da venda de uma só vez
        List<Long> idsProdutos = venda.getItens().stream().map(VendaItemModel::getIdProduto).collect(Collectors.toList());
        List<ProdutoModel> produtosDaVenda = produtoRepository.findAllById(idsProdutos);
        Map<Long, ProdutoModel> mapaProdutos = produtosDaVenda.stream().collect(Collectors.toMap(ProdutoModel::getId, p -> p));

        // Para cada item na venda, devolve a quantidade ao estoque do produto correspondente
        for (VendaItemModel item : venda.getItens()) {
            ProdutoModel produto = mapaProdutos.get(item.getIdProduto());
            if (produto != null) {
                produto.setEstoque(produto.getEstoque().add(item.getQuantidade()));
            }
        }
        produtoRepository.saveAll(produtosDaVenda);

        // Atualização Final do Status da Venda ---
        venda.setIdStatus(statusCancelado.getId());
        vendaRepository.save(venda);
    }

    /**
     * Gera um relatório Detalhado de vendas para um determinado período.
     * @param dataInicial A data de início do período.
     * @param dataFinal A data de fim do período.
     * @return Um DTO com os detalhes de vendas para o período.
     */
    @Transactional(readOnly = true)
    public RelatorioVendasDetalhadoDTO gerarRelatorioVendasDetalhado(LocalDate dataInicial, LocalDate dataFinal, String nomeStatus) {
        LocalDateTime inicioDoDia = dataInicial.atStartOfDay();
        LocalDateTime fimDoDia = dataFinal.atTime(23, 59, 59);

        List<VendaModel> vendas;
        if (nomeStatus != null && !nomeStatus.isBlank()) {
            StatusModel status = statusRepository.findByDescricao(nomeStatus.toUpperCase()).orElseThrow(() -> new ObjectNotFoundException("Status não encontrado: " + nomeStatus));
            vendas = vendaRepository.findByDataHoraBetweenAndIdStatus(inicioDoDia, fimDoDia, status.getId());
        } else {
            vendas = vendaRepository.findByDataHoraBetween(inicioDoDia, fimDoDia);
        }
        // Otimização: buscar todos os clientes e status necessários de uma vez
        List<Long> idsClientes = vendas.stream()
                .map(venda -> {
                    UsuarioEnderecoModel ue = usuarioEnderecoRepository.findById(venda.getIdUsuarioEndereco()).orElse(null);
                    return ue != null ? ue.getIdUsuario() : null;
                })
                .filter(id -> id != null).distinct().collect(Collectors.toList());
        Map<Long, UsuarioModel> mapaClientes = usuarioRepository.findAllById(idsClientes).stream().collect(Collectors.toMap(UsuarioModel::getId, u -> u));

        List<Long> idsStatus = vendas.stream().map(VendaModel::getIdStatus).distinct().collect(Collectors.toList());
        Map<Long, StatusModel> mapaStatus = statusRepository.findAllById(idsStatus).stream().collect(Collectors.toMap(StatusModel::getId, s -> s));


        // Monta a lista de detalhes
        List<VendaDetalheDTO> detalhes = vendas.stream().map(venda -> {
            UsuarioEnderecoModel ue = usuarioEnderecoRepository.findById(venda.getIdUsuarioEndereco()).get();
            UsuarioModel cliente = mapaClientes.get(ue.getIdUsuario());
            StatusModel status = mapaStatus.get(venda.getIdStatus());
            String nomeCliente = (cliente != null) ? cliente.getNome() + " " + cliente.getSobrenome() : "N/A";

            BigDecimal totalBruto = venda.getTotalBruto() != null ? venda.getTotalBruto() : BigDecimal.ZERO;
            BigDecimal desconto = venda.getDesconto() != null ? venda.getDesconto() : BigDecimal.ZERO;
            BigDecimal acrescimo = venda.getAcrescimo() != null ? venda.getAcrescimo() : BigDecimal.ZERO;
            BigDecimal totalLiquido = venda.getTotalLiquido() != null ? venda.getTotalLiquido() : BigDecimal.ZERO;

            return new VendaDetalheDTO(
                    venda.getId(),
                    venda.getDataHora(),
                    nomeCliente,
                    totalBruto,
                    desconto,
                    acrescimo,
                    totalLiquido,
                    status.getDescricao()
            );
        }).collect(Collectors.toList());

        // Calcula os totais agregados para o cabeçalho do relatório
        BigDecimal totalBruto = detalhes.stream().map(VendaDetalheDTO::totalBruto).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalDescontos = detalhes.stream().map(VendaDetalheDTO::desconto).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalAcrescimos = detalhes.stream().map(VendaDetalheDTO::acrescimo).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalLiquido = detalhes.stream().map(VendaDetalheDTO::totalLiquido).reduce(BigDecimal.ZERO, BigDecimal::add);

        // Retorna o DTO do relatório completo com todos os totais
        return new RelatorioVendasDetalhadoDTO(dataInicial, dataFinal, nomeStatus, (long) detalhes.size(), totalBruto, totalDescontos, totalAcrescimos, totalLiquido, detalhes);
    }

    private void atualizarStatusPosConfirmacao(VendaModel venda) {
        boolean pagamentoConfirmado = venda.getDataHoraPagamento() != null;
        boolean entregaConfirmada = venda.getDataHoraDaEntrega() != null;

        // Regra RN03: Se ambos foram confirmados, o status vira "CONCLUÍDO"
        if (pagamentoConfirmado && entregaConfirmada) {
            StatusModel statusConcluido = statusRepository.findByDescricao(concluido)
                    .orElseThrow(() -> new BusinessRuleException("Status 'CONCLUÍDO' não foi encontrado no sistema."));
            venda.setIdStatus(statusConcluido.getId());
        }
        // Regra RN02: Se apenas o pagamento foi confirmado
        else if (pagamentoConfirmado) {
            StatusModel statusPago = statusRepository.findByDescricao(pago)
                    .orElseThrow(() -> new BusinessRuleException("Status 'PAGO' não foi encontrado no sistema."));
            venda.setIdStatus(statusPago.getId());
        }
        // Regra RN01: Se apenas a entrega foi confirmada
        else if (entregaConfirmada) {
            StatusModel statusEntregue = statusRepository.findByDescricao(entregue)
                    .orElseThrow(() -> new BusinessRuleException("Status 'ENTREGUE' não foi encontrado no sistema."));
            venda.setIdStatus(statusEntregue.getId());
        }
    }
}