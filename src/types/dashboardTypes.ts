// Dashboard DTOs for financial data, users, delinquency, and related metrics
import { FiltroOption } from '@/app/hooks/useDateFilter';

export interface OverviewAcummulatedDelinquencyDto {
  lastMonthTaxVariation: number;
  accumulatedDelinquency: AccumulatedDelinquencyDto[];
}

export interface TotalVidasDto {
  total: number;
  message: string;
  percentageChange: number;
}

export interface TotalEmpresasDto {
  total: number;
  message: string;
  percentageChange: number;
}

export interface TotalCpfDto {
  total: number;
  message: string;
  percentageChange: number;
}

export interface FaixaEtariaDto {
  faixa: string;
  quantidade: number;
}

export interface ClientesPorSexoDto {
  quantidadeMasculino: number;
  quantidadeFeminino: number;
  quantidadeOutros: number;
  porcentagemMasculino: number;
  porcentagemFeminino: number;
  porcentagemOutros: number;
  diferencaMasculino: number;
  diferencaFeminino: number;
  diferencaOutros: number;
}

export interface FaturamentoMensalDto {
  total: number;
  anterior: number;
  percentageChange: number;
  periodoSelecionado: string;
  periodoAnterior: string;
  message: string;
}

export interface TaxaUtilizacaoDto {
  rate: number;
  percentageChange: number;
  message: string;
}

export interface MensalidadeMediaDto {
  average: number;
  previousAverage: number;
  periodoSelecionado: string;
  periodoAnterior: string;
  percentageChange: number;
  message: string;
}

export interface MensalidadeMediaPorConvenioDto {
  nomeConvenio: string;
  previousAverage: number;
  average: number;
  periodoSelecionado: string;
  periodoAnterior: string;
  percentageChange: number;
}

export interface MesFaturamentoDto {
  mes: number;
  valorPago: number;
  valorPrevisto: number;
  valorInadimplencia: number;
  despesasPagas: number;
  despesasPrevistas: number;
  despesasInadimplencia: number;
}

export interface EvolucaoFaturamentoDto {
  meses: MesFaturamentoDto[];
}

export interface FaturamentoPorConvenioDto {
  nomeConvenio: string;
  valorTotalFaturado: number;
  valorTotalTaxaAdm: number;
}

export interface FaturamentoPorConvenioReferenciaDto {
  nomeConvenio: string;
  valorTotalFaturado: number;
  valorTotalTaxaAdm: number;
}

export interface DependentesTitularesDto {
  titulares: number;
  dependentes: number;
  titularesLastMonth: number;
  dependentesLastMonth: number;
  titularesGrowth: number;
  dependentesGrowth: number;
}

export interface ResumoUsuariosDto {
  totalAtivos: number;
  totalDesligados: number;
  totalNovos: number;
  valorDesligados: number;
  valorNovos: number;
  faturamentoTotal: number;
}

export interface UsuariosPorConvenioDto {
  codConvenio: number;
  nomeConvenio: string;
  geral: ResumoUsuariosDto;
  pf: ResumoUsuariosDto;
  pj: ResumoUsuariosDto;
}

export interface TotalUsuariosConvenioDto {
  dataReferencia: string;
  geral: ResumoUsuariosDto;
  pf: ResumoUsuariosDto;
  pj: ResumoUsuariosDto;
  porConvenio: UsuariosPorConvenioDto[];
}

export interface ResumoFaturamentoDto {
  totalGeral: number;
  totalPago: number;
  totalAberto: number;
  totalVencido: number;
}

export interface FaturamentoDetalhadoConvenioDto {
  codConvenio: number;
  nomeConvenio: string;
  percentual: number;
  associados: number;
  faturamento: ResumoFaturamentoDto;
}

export interface TotalFaturamentoPorConvenioDto {
  dataReferencia: string;
  geral: ResumoFaturamentoDto;
  porConvenio: FaturamentoDetalhadoConvenioDto[];
}

export interface TotalFaturamentoDto {
  dataReferencia: string;
  totalGeral: number;
  totalPago: number;
  totalAberto: number;
  totalVencido: number;
}

export interface PagamentoCentroCustoDto {
  valorTotal: number;
  emAberto: number;
  liquidado: number;
  valorVencido: number;
}

export interface TotalFaturamentoDto {
  dataReferencia: string;
  geral: ResumoFaturamentoDto;
  quantidadeClientes: number;
  despesas: PagamentoCentroCustoDto;
  fluxoCaixa: PagamentoCentroCustoDto;
  resultadoPrevisto: number;
  resultadoRealizado: number;
  porConvenio: FaturamentoDetalhadoConvenioDto[];
}

export interface EventAnalyticsDto {
  nomeEvento: string;
  nomeGrupo?: string;
  totalFaturamento: number;
  totalPago: number;
  totalAberto: number;
  totalVencido: number;
}

export interface CashFlowEvolutionDto {
  data: string;
  nomeBanco: string;
  nomeMovimentacao: string;
  totalEntrada: number;
  totalSaida: number;
  saldoDoDia: number;
  saldoAcumulado: number;
}

export interface TotalFiliadosDto {
  totalAtivos: number;
  totalDesligados: number;
  totalNovos: number;
  valorDesligados: number;
  valorNovos: number;
  faturamentoTotal: number;
  dataReferencia: string;
}

export interface VidasPorConvenioDto {
  nomeConvenio: string;
  quantidadeVidasPF: number;
  quantidadeEmpresas: number;
  quantidadeVidasPFAnterior: number;
  quantidadeEmpresasAnterior: number;
  diferencaVidasPF: number;
  diferencaEmpresas: number;
}

export interface NovasVidasDto {
  quantidadePF: number;
  quantidadePJ: number;
  total: number;
}

export interface UsuarioDashboardWidgetDto {
  id: number;
  codUsu: number;
  dashboardWidgetId: number;
  isFavorite: boolean;
}

export interface FinancialEvolutionDto {
  data: string;
  nomeBanco: string;
  codigoBanco: number;
  totalReceber: number;
  totalPagar: number;
  saldoDoDia: number;
  saldoAcumulado: number;
}

export interface FinancialEvolutionResponseDto {
  data: FinancialEvolutionDto[];
  bancoPrincipal: string;
}

export interface AccumulatedDelinquencyDto {
  mes: number;
  valorMensal: number;
  valorAcumulado: number;
}

export interface DailyDelinquencyDto {
  data: string;
  valorDiario: number;
  valorAcumulado: number;
}

export interface DelinquencyAgingDto {
  diasVencido: number;
  descricao: string;
  quantidade: number;
  valor: number;
}

export interface DelinquencySummaryDto {
  totalFaturado: number;
  totalInadimplente: number;
  totalAdimplente: number;
  totalAReceber: number;
  percentualInadimplencia: number;
  percentualAdimplencia: number;
  percentualAReceber: number;
}

export interface ResumoMensalFinanceiroDto {
  mes: number;
  totalCobranca: number;
  totalPagamento: number;
  totalFaturado: number;
  totalVencido: number;
  totalAberto: number;
  resultado: number;
}

export interface PrevisaoFaturamentoPagamentoResumoDto {
  competencia: string;
  receita: number;
  despesa: number;
  lucratividade: number;
}

export interface DetalhamentoPrevisaoFaturamentoDespesaItemDto {
  competencia: string;
  mensalidade: number;
  utilizacaoServico: number;
  valorAjuste: number;
  valorTotal: number;
  contasAPagar: number;
  resultadoPrevisto: number;
  lucratividade: number;
}

export interface DetalhamentoPrevisaoFaturamentoDespesaDto {
  totalMensalidade: number;
  totalUtilizacaoServico: number;
  totalValorAjuste: number;
  totalValorTotal: number;
  totalContasApagar: number;
  totalResultadoPrevisto: number;
  totalLucratividade: number;
  items: DetalhamentoPrevisaoFaturamentoDespesaItemDto[];
}

export interface DetalhamentoFaturamentoPrevistoRealizadoItemDto {
  competencia: string;
  qtdeCobranca: number;
  mensalidade: number;
  utilizacaoServico: number;
  valorTotalPrevisto: number;
  valorEmAberto: number;
  contasPagarAberto: number;
  valorReceitaRealizado: number;
  valorDespesasRealizado: number;
  resultadoRealizado: number;
}

export interface DetalhamentoFaturamentoPrevistoRealizadoDto {
  items: DetalhamentoFaturamentoPrevistoRealizadoItemDto[];
  totalMensalidade: number;
  totalUtilizacaoServico: number;
  totalValorTotalPrevisto: number;
  totalValorEmAberto: number;
  totalContasPagarAberto: number;
  totalReceitaRealizada: number;
  totalDespesasRealizadas: number;
  totalResultadoRealizado: number;
}

export interface DashboardFaturamentoPayloadDto {
  resumoGrafico: PrevisaoFaturamentoPagamentoResumoDto[];
  tabelaSimulacao: DetalhamentoPrevisaoFaturamentoDespesaDto | null;
  tabelaPrevistoRealizado: DetalhamentoFaturamentoPrevistoRealizadoDto | null;
}

export interface TotalDespesasPorConvenioDto {
  valorTotal: number;
  emAberto: number;
  liquidado: number;
  valorVencido: number;
}

export interface GrupoBancoDto {
  nomeGrupo: string;
  codigo: number;
}

export interface FiltrosDashboardDto {
  convenios: FiltroOption[];
  servicos: FiltroOption[];
  centrosCusto: FiltroOption[];
  planosConta: FiltroOption[];
}

export interface EvolucaoFinanceiraItemDto {
  competencia: string;
  faturamento: number;
  receitaEntradaCaixa: number;
  despesaSaidaCaixa: number;
  lucroPrejuizo: number;
}

export interface EvolucaoFinanceiraPayloadDto {
  items: EvolucaoFinanceiraItemDto[];
  totalFaturamento: number;
  totalReceitaEntradaCaixa: number;
  totalDespesaSaidaCaixa: number;
  totalLucroPrejuizo: number;
}

