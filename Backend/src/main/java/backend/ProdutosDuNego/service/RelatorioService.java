package backend.ProdutosDuNego.service;


import backend.ProdutosDuNego.rest.dto.*;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class RelatorioService {
    private static final Logger logger = LoggerFactory.getLogger(RelatorioService.class);
    /**
     * Classe interna privada que lida com o evento de "pintar" o fundo de cada página do PDF.
     */
    private static class BackgroundEvent extends PdfPageEventHelper {
        private final Color backgroundColor;

        public BackgroundEvent(Color backgroundColor) {
            this.backgroundColor = backgroundColor;
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte canvas = writer.getDirectContentUnder();
            Rectangle rect = document.getPageSize();
            canvas.setColorFill(backgroundColor);
            canvas.rectangle(rect.getLeft(), rect.getBottom(), rect.getWidth(), rect.getHeight());
            canvas.fill();
        }
    }

    /**
     * Cria um PDF do Relatório de Vendas Detalhado.
     * @param relatorio Os dados do relatório a serem impressos.
     * @return Um stream de bytes contendo o PDF gerado.
     */
    public ByteArrayInputStream gerarPdfVendasDetalhado(RelatorioVendasDetalhadoDTO relatorio) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new BackgroundEvent(new Color(247,247,247)));
            document.open();

            adicionarCabecalho(document);

            // Título
            Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph titulo = new Paragraph("Relatório Detalhado de Vendas", fontTitulo);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingBefore(20);
            document.add(titulo);

            // Período
            DateTimeFormatter dataFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            Paragraph periodo = new Paragraph("Período de " + relatorio.dataInicial().format(dataFormatter) + " a " + relatorio.dataFinal().format(dataFormatter));
            periodo.setAlignment(Element.ALIGN_CENTER);
            document.add(periodo);
            document.add(Chunk.NEWLINE);

            // --- CORREÇÃO DA TABELA ---
            PdfPTable tabelaVendas = new PdfPTable(7); // 7 colunas
            tabelaVendas.setWidthPercentage(100);
            // Ajustando as larguras relativas para dar mais espaço onde é necessário
            tabelaVendas.setWidths(new float[]{0.8f, 2.5f, 3.5f, 1.5f, 1.5f, 2f, 2f});
            tabelaVendas.setSpacingBefore(15);

            // Cabeçalhos da tabela
            addCell(tabelaVendas, "ID", FontFactory.HELVETICA_BOLD, Element.ALIGN_CENTER);
            addCell(tabelaVendas, "Data", FontFactory.HELVETICA_BOLD, Element.ALIGN_CENTER);
            addCell(tabelaVendas, "Cliente", FontFactory.HELVETICA_BOLD, Element.ALIGN_CENTER);
            addCell(tabelaVendas, "Desconto", FontFactory.HELVETICA_BOLD, Element.ALIGN_CENTER);
            addCell(tabelaVendas, "Acréscimo", FontFactory.HELVETICA_BOLD, Element.ALIGN_CENTER); // <-- Agora terá espaço
            addCell(tabelaVendas, "Total Líq.", FontFactory.HELVETICA_BOLD, Element.ALIGN_CENTER);
            addCell(tabelaVendas, "Status", FontFactory.HELVETICA_BOLD, Element.ALIGN_CENTER);

            // Itens da tabela
            DateTimeFormatter dataHoraFormatter = DateTimeFormatter.ofPattern("dd/MM/yy HH:mm");
            for (VendaDetalheDTO venda : relatorio.vendas()) {
                addCell(tabelaVendas, venda.idVenda().toString(), Element.ALIGN_CENTER);
                addCell(tabelaVendas, venda.data().format(dataHoraFormatter), Element.ALIGN_CENTER);
                addCell(tabelaVendas, venda.nomeCliente(), Element.ALIGN_LEFT);
                addCell(tabelaVendas, formatarMoeda(venda.desconto()), Element.ALIGN_RIGHT);
                addCell(tabelaVendas, formatarMoeda(venda.acrescimo()), Element.ALIGN_RIGHT);
                addCell(tabelaVendas, formatarMoeda(venda.totalLiquido()), Element.ALIGN_RIGHT);
                addCell(tabelaVendas, venda.status(), Element.ALIGN_CENTER);
            }
            document.add(tabelaVendas);

            // Totais no final do relatório
            document.add(Chunk.NEWLINE);
            Paragraph totais = new Paragraph(
                    "Total de Vendas: " + relatorio.totalDeVendas() + "\n" +
                            "Valor Total Bruto: " + formatarMoeda(relatorio.valorTotalBruto()) + "\n" +
                            "Total em Descontos: " + formatarMoeda(relatorio.valorTotalDescontos()) + "\n" +
                            "Total em Acréscimos: " + formatarMoeda(relatorio.valorTotalAcrescimos()) + "\n" +
                            "Valor Total Líquido Consolidado: " + formatarMoeda(relatorio.valorTotalLiquido()),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD)
            );
            totais.setAlignment(Element.ALIGN_RIGHT);
            document.add(totais);

        } catch (DocumentException e) {
            logger.error("Erro ao gerar PDF do Relatório de Vendas para o período de {} a {}",
                    relatorio.dataInicial(), relatorio.dataFinal(), e);
        } finally {
            document.close();
        }
        return new ByteArrayInputStream(out.toByteArray());
    }
    /**
     * Cria um PDF do Relatório de Compras Detalhado e Corrigido.
     * @param relatorio O DTO contendo os dados da compra a serem impressos.
     * @return Um stream de bytes contendo o PDF gerado.
     */
    public ByteArrayInputStream gerarPdfComprasDetalhado(RelatorioComprasDTO relatorio) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new BackgroundEvent(new Color(247, 247, 247)));
            document.open();

            // Adiciona o cabeçalho com logo e data de geração
            adicionarCabecalho(document);

            // Título Principal
            Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph titulo = new Paragraph("Relatório Detalhado de Compras", fontTitulo);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingBefore(20);
            document.add(titulo);

            // Período do Relatório
            DateTimeFormatter dataFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            Paragraph periodo = new Paragraph("Período de " + relatorio.dataInicial().format(dataFormatter) + " a " + relatorio.dataFinal().format(dataFormatter));
            periodo.setAlignment(Element.ALIGN_CENTER);
            document.add(periodo);
            document.add(Chunk.NEWLINE);

            // --- TABELA UNIFICADA E CORRIGIDA ---
            // A tabela agora tem 7 colunas para incluir o ID
            PdfPTable tabela = new PdfPTable(7);
            tabela.setWidthPercentage(100);
            // Larguras ajustadas para as 7 colunas
            tabela.setWidths(new float[]{1, 2, 3, 3, 1.5f, 2, 2});
            tabela.setSpacingBefore(15);

            // Cabeçalhos da tabela, incluindo o "ID Compra"
            addCell(tabela, "ID", FontFactory.HELVETICA_BOLD, Element.ALIGN_CENTER);
            addCell(tabela, "Data", FontFactory.HELVETICA_BOLD, Element.ALIGN_CENTER);
            addCell(tabela, "Fornecedor", FontFactory.HELVETICA_BOLD, Element.ALIGN_CENTER);
            addCell(tabela, "Produto", FontFactory.HELVETICA_BOLD, Element.ALIGN_CENTER);
            addCell(tabela, "Qtd.", FontFactory.HELVETICA_BOLD, Element.ALIGN_CENTER);
            addCell(tabela, "Valor Unit.", FontFactory.HELVETICA_BOLD, Element.ALIGN_CENTER);
            addCell(tabela, "Valor Total", FontFactory.HELVETICA_BOLD, Element.ALIGN_CENTER);

            // Corpo da tabela, agora adicionando o ID da compra
            for (CompraItemDetalheDTO compra : relatorio.compras()) {
                addCell(tabela, compra.idCompra().toString(), Element.ALIGN_CENTER); // <-- ID ADICIONADO
                addCell(tabela, compra.data().format(dataFormatter), Element.ALIGN_CENTER);
                addCell(tabela, compra.nomeFornecedor(), Element.ALIGN_LEFT);
                addCell(tabela, compra.nomeProduto(), Element.ALIGN_LEFT);
                addCell(tabela, compra.quantidade().toString(), Element.ALIGN_CENTER);
                addCell(tabela, formatarMoeda(compra.valorUnitario()), Element.ALIGN_RIGHT);
                addCell(tabela, formatarMoeda(compra.totalItem()), Element.ALIGN_RIGHT);
            }
            document.add(tabela);

            // --- RESUMO GERAL NO FINAL (continua o mesmo) ---
            document.add(Chunk.NEWLINE);
            Paragraph totais = new Paragraph(
                    "Total de Itens Comprados no Período: " + relatorio.totalDeItensComprados() + "\n" +
                            "Valor Total Geral Gasto: " + formatarMoeda(relatorio.valorTotalGasto()),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD)
            );
            totais.setAlignment(Element.ALIGN_RIGHT);
            document.add(totais);

        } catch (DocumentException e) {
            logger.error("Erro ao gerar PDF do Relatório de Compras Detalhado", e);
        } finally {
            document.close();
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    /**
     * Cria um PDF do Relatório de Estoque a partir dos dados fornecidos.
     * @param relatorio O DTO contendo a lista de produtos em estoque e os totais.
     * @return Um stream de bytes contendo o PDF gerado.
     */
    public ByteArrayInputStream gerarPdfEstoque(RelatorioEstoqueDTO relatorio) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            // Reutiliza o nosso evento para a cor de fundo
            writer.setPageEvent(new BackgroundEvent(new Color(245, 245, 245)));
            document.open();

            // Adiciona o cabeçalho padrão com logo e data de geração
            adicionarCabecalho(document);

            // Título Principal
            Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph titulo = new Paragraph("Relatório de Estoque Atual", fontTitulo);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingBefore(20);
            document.add(titulo);
            document.add(Chunk.NEWLINE);

            // --- Tabela de Estoque ---
            PdfPTable tabela = new PdfPTable(5); // 5 colunas
            tabela.setWidthPercentage(100);
            tabela.setWidths(new float[]{1, 4, 2, 2, 2.5f}); // Larguras ajustadas
            tabela.setSpacingBefore(15);

            // Cabeçalhos da tabela
            addCell(tabela, "ID", FontFactory.HELVETICA_BOLD, Element.ALIGN_CENTER);
            addCell(tabela, "Produto", FontFactory.HELVETICA_BOLD, Element.ALIGN_CENTER);
            addCell(tabela, "Qtd. em Estoque", FontFactory.HELVETICA_BOLD, Element.ALIGN_CENTER);
            addCell(tabela, "Valor Unit.", FontFactory.HELVETICA_BOLD, Element.ALIGN_CENTER);
            addCell(tabela, "Valor Total do Item", FontFactory.HELVETICA_BOLD, Element.ALIGN_CENTER);

            // Corpo da tabela com os dados de cada produto
            for (ItemEstoqueDTO item : relatorio.itens()) {
                addCell(tabela, item.idProduto().toString(), Element.ALIGN_CENTER);
                addCell(tabela, item.nomeProduto(), Element.ALIGN_LEFT);
                addCell(tabela, item.quantidadeEmEstoque().toString(), Element.ALIGN_CENTER);
                addCell(tabela, formatarMoeda(item.valorUnitario()), Element.ALIGN_RIGHT);
                addCell(tabela, formatarMoeda(item.valorTotalEmEstoque()), Element.ALIGN_RIGHT);
            }
            document.add(tabela);

            // --- RESUMO GERAL NO FINAL ---
            document.add(Chunk.NEWLINE);
            Paragraph totais = new Paragraph(
                    "Total de Produtos em Estoque: " + relatorio.totalDeProdutos() + "\n" +
                            "Valor Total Geral do Estoque: " + formatarMoeda(relatorio.valorTotalGeralDoEstoque()),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD)
            );
            totais.setAlignment(Element.ALIGN_RIGHT);
            document.add(totais);

        } catch (DocumentException e) {
            logger.error("Erro ao gerar PDF do Relatório de Estoque", e);
        } finally {
            document.close();
        }
        return new ByteArrayInputStream(out.toByteArray());
    }



    /**
     * Adiciona um cabeçalho padrão com logo e data de geração ao documento.
     */
    private void adicionarCabecalho(Document document) throws DocumentException {
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{1, 3});
        headerTable.getDefaultCell().setBorder(Rectangle.NO_BORDER);

        try {
            Image logo = Image.getInstance(RelatorioService.class.getClassLoader().getResource("LogoProdutosduNego.png"));
            logo.scaleToFit(100, 100);
            PdfPCell logoCell = new PdfPCell(logo);
            logoCell.setBorder(Rectangle.NO_BORDER);
            logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            headerTable.addCell(logoCell);
        } catch (IOException | BadElementException e) {
            headerTable.addCell(""); // Célula vazia para não quebrar o layout se o logo falhar
            System.err.println("Arquivo de logo não encontrado em src/main/resources/LogoProdutosduNego.png");
        }

        DateTimeFormatter dataHoraFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        Paragraph dataGeracao = new Paragraph("Relatório gerado em: " + LocalDateTime.now().format(dataHoraFormatter));
        dataGeracao.setAlignment(Element.ALIGN_RIGHT);
        PdfPCell dataCell = new PdfPCell(dataGeracao);
        dataCell.setBorder(Rectangle.NO_BORDER);
        dataCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        headerTable.addCell(dataCell);

        document.add(headerTable);
    }

    private void addCell(PdfPTable table, String text, int horizontalAlignment) {
        addCell(table, text, FontFactory.HELVETICA, horizontalAlignment);
    }

    private void addCell(PdfPTable table, String text, String fontName, int horizontalAlignment) {
        Font font = FontFactory.getFont(fontName);
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5);
        cell.setHorizontalAlignment(horizontalAlignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        // Adiciona uma cor de fundo ao cabeçalho para destacar
        if (fontName.equals(FontFactory.HELVETICA_BOLD)) {
            cell.setBackgroundColor(new Color(224, 224, 224)); // Cinza claro
        }
        table.addCell(cell);
    }

    /**
     * Formata um valor BigDecimal para o formato de moeda brasileiro (R$).
     */
    private String formatarMoeda(BigDecimal valor) {
        if (valor == null) {
            valor = BigDecimal.ZERO;
        }
        return "R$ " + String.format("%.2f", valor).replace('.', ',');
    }
}