package backend.ProdutosDuNego.service;

import backend.ProdutosDuNego.exception.BusinessRuleException;
import backend.ProdutosDuNego.exception.ObjectNotFoundException;
import backend.ProdutosDuNego.model.CompraItemModel;
import backend.ProdutosDuNego.model.FornecedorModel;
import backend.ProdutosDuNego.model.ProdutoModel;
import backend.ProdutosDuNego.repository.CompraItemRepository;
import backend.ProdutosDuNego.repository.FornecedorRepository;
import backend.ProdutosDuNego.repository.ProdutoRepository;
import backend.ProdutosDuNego.rest.dto.CompraItemDTO;
import backend.ProdutosDuNego.rest.dto.CompraItemDetalheDTO;
import backend.ProdutosDuNego.rest.dto.RelatorioComprasDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.math.BigDecimal;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CompraService {

    private final CompraItemRepository compraItemRepository;
    private final ProdutoRepository produtoRepository;
    private final FornecedorRepository fornecedorRepository;

    @Autowired
    public CompraService(CompraItemRepository compraItemRepository, ProdutoRepository produtoRepository, FornecedorRepository fornecedorRepository) {
        this.compraItemRepository = compraItemRepository;
        this.produtoRepository = produtoRepository;
        this.fornecedorRepository = fornecedorRepository;
    }
    /**
     * Lista todos os registros de compra existentes.
     */
    @Transactional(readOnly = true)
    public List<CompraItemModel> obterTodasAsCompras() {
        return compraItemRepository.findAll();
    }
    /**
     * Registra uma nova compra de um item de produto e atualiza o estoque.
     * @param dto Os dados da compra enviados pelo administrador.
     */
    @Transactional
    public void registrarCompra(CompraItemDTO dto) {

        ProdutoModel produto = produtoRepository.findById(dto.idProduto())
                .orElseThrow(() -> new ObjectNotFoundException("Produto não encontrado com o ID: " + dto.idProduto()));

        fornecedorRepository.findById(dto.idFornecedor())
                .orElseThrow(() -> new ObjectNotFoundException("Fornecedor não encontrado com o ID: " + dto.idFornecedor()));

        BigDecimal estoqueAtual = produto.getEstoque();
        BigDecimal novoEstoque = estoqueAtual.add(dto.quantidade());
        produto.setEstoque(novoEstoque);
        produtoRepository.save(produto);

        BigDecimal totalItem = dto.quantidade().multiply(dto.valorUnitario());

        CompraItemModel novaCompra = new CompraItemModel();
        novaCompra.setIdProduto(dto.idProduto());
        novaCompra.setIdFornecedor(dto.idFornecedor());
        novaCompra.setQuantidade(dto.quantidade());
        novaCompra.setValor(dto.valorUnitario());
        novaCompra.setTotal(totalItem);
        novaCompra.setData(LocalDate.now());

        compraItemRepository.save(novaCompra);
    }


    /**
     * Deleta um registro de compra permanentemente e reverte o estoque.
     * @param compraId O ID do CompraItem a ser deletado.
     */
    @Transactional
    public void deletarCompra(Long compraId) {
        // 1. Busca o registro da compra que será deletado
        CompraItemModel compra = compraItemRepository.findById(compraId)
                .orElseThrow(() -> new ObjectNotFoundException("Registro de compra não encontrado com o ID: " + compraId));

        // 2. Busca o produto associado para reverter o estoque
        ProdutoModel produto = produtoRepository.findById(compra.getIdProduto())
                .orElseThrow(() -> new ObjectNotFoundException("Produto associado à compra não encontrado. ID: " + compra.getIdProduto()));

        // 3. Reverte o estoque
        BigDecimal estoqueAtual = produto.getEstoque();
        BigDecimal novoEstoque = estoqueAtual.subtract(compra.getQuantidade());

        // Validação para garantir que o estoque não fique negativo
        if (novoEstoque.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessRuleException("Não é possível deletar a compra pois o estoque do produto ficaria negativo. Verifique as vendas realizadas.");
        }

        produto.setEstoque(novoEstoque);
        produtoRepository.save(produto);

        // 4. DELETA o registro da compra do banco de dados
        compraItemRepository.deleteById(compraId);
    }
    /**
     * Gera um relatório detalhado de compras para um determinado período.
     * @param dataInicial A data de início do período.
     * @param dataFinal A data de fim do período.
     * @return Um DTO com os totais e a lista detalhada de compras para o período.
     */
    @Transactional(readOnly = true)
    public RelatorioComprasDTO gerarRelatorioCompras(LocalDate dataInicial, LocalDate dataFinal) {
        // 1. Busca todos os registos de compra no período especificado.
        List<CompraItemModel> compras = compraItemRepository.findByDataBetween(dataInicial, dataFinal);

        // 2. Otimização: busca todos os produtos e fornecedores necessários de uma só vez
        // para evitar múltiplas consultas ao banco dentro de um loop (problema N+1).
        List<Long> idsProdutos = compras.stream().map(CompraItemModel::getIdProduto).distinct().collect(Collectors.toList());
        Map<Long, ProdutoModel> mapaProdutos = produtoRepository.findAllById(idsProdutos).stream()
                .collect(Collectors.toMap(ProdutoModel::getId, p -> p));

        List<Long> idsFornecedores = compras.stream().map(CompraItemModel::getIdFornecedor).distinct().collect(Collectors.toList());
        Map<Long, FornecedorModel> mapaFornecedores = fornecedorRepository.findAllById(idsFornecedores).stream()
                .collect(Collectors.toMap(FornecedorModel::getId, f -> f));

        // 3. Monta a lista de detalhes para o relatório, enriquecendo cada item de compra.
        List<CompraItemDetalheDTO> detalhes = compras.stream().map(compra -> {
            ProdutoModel produto = mapaProdutos.get(compra.getIdProduto());
            FornecedorModel fornecedor = mapaFornecedores.get(compra.getIdFornecedor());
            String nomeProduto = produto != null ? produto.getNome() : "Produto não encontrado";

            // Lógica para usar o nome da empresa ou, na sua ausência, o nome do vendedor.
            String nomeFornecedor;
            if (fornecedor != null) {
                nomeFornecedor = (fornecedor.getEmpresa() != null && !fornecedor.getEmpresa().isBlank())
                        ? fornecedor.getEmpresa()
                        : fornecedor.getNomeVendedor();
            } else {
                nomeFornecedor = "Fornecedor não encontrado";
            }

            // Cria o DTO de detalhe para esta linha do relatório.
            return new CompraItemDetalheDTO(
                    compra.getId(),
                    compra.getData(),
                    nomeProduto,
                    nomeFornecedor,
                    compra.getQuantidade(),
                    compra.getValor(), // Valor unitário
                    compra.getTotal()  // Valor total (qtd * valor)
            );
        }).collect(Collectors.toList());

        // 4. Calcula o valor total geral gasto somando o total de cada item.
        BigDecimal valorTotalGasto = detalhes.stream()
                .map(CompraItemDetalheDTO::totalItem)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 5. Monta e retorna o DTO do relatório completo, que será usado para gerar o PDF.
        return new RelatorioComprasDTO(dataInicial, dataFinal, (long) detalhes.size(), valorTotalGasto, detalhes);
    }
}