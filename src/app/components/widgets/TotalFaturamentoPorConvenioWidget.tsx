import { useTheme, alpha } from "@mui/material/styles";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  LinearProgress,
  useMediaQuery,
  Divider,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";

import type { DateFilterTab } from "../../hooks/useDateFilter";
import {
  useTotalFaturamentoPorConvenioWithFilters,
  useTotalFaturamentoPorConvenioReferenciaWithFilters,
} from "../../hooks/useDashboard";
import WidgetLoading from "../ui/WidgetLoading";
import { ResumoFaturamentoDto } from "../../services/dashboardService";

interface TotalFaturamentoPorConvenioWidgetProps {
  initialIsFavorite?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  tab?: DateFilterTab;
  convenios?: number[];
  servicos?: number[];
  centrosCusto?: number[];
  planosContas?: number[];
}

// Componente auxiliar para renderizar os valores financeiros
function MetricItem({
  label,
  value,
  color,
  money = false,
  bold = false,
}: {
  label: string;
  value: number;
  color: string;
  money?: boolean;
  bold?: boolean;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Typography variant="caption" color="text.secondary" fontWeight={500}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={bold ? 700 : 500}
        sx={{ color: color }}
      >
        {money
          ? value.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          : value.toLocaleString("pt-BR")}
      </Typography>
    </Box>
  );
}

export function TotalFaturamentoPorConvenioWidget({
  initialIsFavorite = false,
  startDate = null,
  endDate = null,
  tab = "vencimento",
  convenios = [],
  servicos = [],
  centrosCusto = [],
  planosContas = [],
}: TotalFaturamentoPorConvenioWidgetProps) {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const startStr = startDate ? format(startDate, "yyyy-MM-dd") : undefined;
  const endStr = endDate ? format(endDate, "yyyy-MM-dd") : undefined;

  const { data: vencimentoData, isLoading: isVencimentoLoading } =
    useTotalFaturamentoPorConvenioWithFilters(
      startStr,
      endStr,
      convenios,
      servicos,
      centrosCusto,
      planosContas,
    );
  const { data: competenciaData, isLoading: isCompetenciaLoading } =
    useTotalFaturamentoPorConvenioReferenciaWithFilters(
      startStr,
      endStr,
      convenios,
      servicos,
      centrosCusto,
      planosContas,
    );

  const isVencimento = tab === "vencimento";
  const tipoDataLabel = isVencimento ? "Por Vencimento" : "Por Competência";
  const widgetData = isVencimento ? vencimentoData : competenciaData;
  const isLoading = isVencimento ? isVencimentoLoading : isCompetenciaLoading;

  if (isLoading) return <WidgetLoading height={400} />;

  const defaultResumo: ResumoFaturamentoDto = {
    totalGeral: 0,
    totalPago: 0,
    totalAberto: 0,
    totalVencido: 0,
  };
  const data = widgetData || {
    dataReferencia: new Date().toISOString(),
    geral: defaultResumo,
    porConvenio: [],
  };
  const safeResumo = (resumo?: ResumoFaturamentoDto) => resumo || defaultResumo;

  const periodoText =
    startDate && endDate
      ? `${format(startDate, "dd/MM/yyyy")} a ${format(endDate, "dd/MM/yyyy")}`
      : format(new Date(), "MMM/yyyy", { locale: ptBR });

  return (
    <Card
      elevation={0}
      sx={{
        height: { xs: "auto", md: "100%" },
        overflow: "hidden",
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardContent
        sx={{
          p: 0,
          height: { xs: "auto", md: "100%" },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.background.default, 0.4),
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Faturamento por Convênio
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Período visualizado: {periodoText} ({tipoDataLabel})
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: 0,
            bgcolor: isMobile
              ? alpha(theme.palette.background.default, 0.5)
              : "transparent",
          }}
        >
          {isMobile ? (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2, width: "100%" }}
            >
              {data.porConvenio.map((item) => {
                const safeFaturamento = safeResumo(item.faturamento);
                console.log(safeFaturamento);
                return (
                  <Card
                    key={item.codConvenio}
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  >
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          mb: 2,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: "#000000",
                            color: "#ffffff",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                          }}
                        >
                          {item.nomeConvenio
                            ? item.nomeConvenio.charAt(0).toUpperCase()
                            : "?"}
                        </Avatar>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {item.nomeConvenio || "Sem Nome"}
                        </Typography>
                      </Box>
                      <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        mb: 2,
                      }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ minWidth: 45, fontWeight: 600 }} >
                          Quantidade: {item.associados}
                          </Typography>
                      </Box>
                      {/* Barra de Progresso */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          mb: 2,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ minWidth: 45, fontWeight: 600 }}
                        >
                          % Total:
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={item.percentual || 0}
                          sx={{
                            flex: 1,
                            height: 6,
                            borderRadius: 1,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            "& .MuiLinearProgress-bar": { borderRadius: 1 },
                          }}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={700}
                        >
                          {(item.percentual || 0).toFixed(1)}%
                        </Typography>
                      </Box>

                      <Divider sx={{ mb: 2, borderStyle: "dashed" }} />

                      {/* Grid com os Valores Financeiros (reaproveitando MetricItem) */}
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 2,
                        }}
                      >
                        <MetricItem
                          label="Faturamento"
                          value={safeFaturamento.totalGeral}
                          color="text.primary"
                          money
                          bold
                        />
                        <MetricItem
                          label="Pago"
                          value={safeFaturamento.totalPago}
                          color="success.main"
                          money
                        />
                        <MetricItem
                          label="Aberto"
                          value={safeFaturamento.totalAberto}
                          color="warning.main"
                          money
                        />
                        <MetricItem
                          label="Vencido"
                          value={safeFaturamento.totalVencido}
                          color="error.main"
                          money
                        />
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}

              {data.porConvenio.length === 0 && (
                <Box
                  sx={{
                    py: 6,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    color: "text.secondary",
                    textAlign: "center",
                  }}
                >
                  <FuseSvgIcon size={40} color="action">
                    heroicons-outline:inbox
                  </FuseSvgIcon>
                  <Typography>
                    Nenhum dado encontrado para os filtros aplicados.
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            
            <TableContainer>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        bgcolor: "background.paper",
                        py: 2,
                      }}
                    >
                      Convênio
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        bgcolor: "background.paper",
                        py: 2,
                      }}
                    >
                      Qtde.
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        bgcolor: "background.paper",
                        py: 2,
                        width: 100,
                      }}
                    >
                      % Total
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 600,
                        bgcolor: "background.paper",
                        py: 2,
                      }}
                    >
                      Faturamento
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 600,
                        bgcolor: "background.paper",
                        py: 2,
                      }}
                    >
                      Pago
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 600,
                        bgcolor: "background.paper",
                        py: 2,
                      }}
                    >
                      Aberto
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 600,
                        bgcolor: "background.paper",
                        py: 2,
                      }}
                    >
                      Vencido
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.porConvenio.map((item) => {
                    const safeFaturamento = safeResumo(item.faturamento);
                    console.log(safeFaturamento);
                    return (
                      <TableRow key={item.codConvenio} hover>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: "#000000",
                                color: "#ffffff",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                              }}
                            >
                              {item.nomeConvenio
                                ? item.nomeConvenio.charAt(0).toUpperCase()
                                : "?"}
                            </Avatar>
                            <Typography variant="body2" fontWeight={500}>
                              {item.nomeConvenio || "Sem Nome"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight={500}>
                            {item.associados}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <LinearProgress
                              variant="determinate"
                              value={item.percentual || 0}
                              sx={{
                                width: 50,
                                height: 6,
                                borderRadius: 1,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                "& .MuiLinearProgress-bar": { borderRadius: 1 },
                              }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.75rem" }}
                            >
                              {(item.percentual || 0).toFixed(1)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={700}>
                            {safeFaturamento.totalGeral.toLocaleString(
                              "pt-BR",
                              { style: "currency", currency: "BRL" },
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            color="success.main"
                            fontWeight={500}
                          >
                            {safeFaturamento.totalPago.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            color="warning.main"
                            fontWeight={500}
                          >
                            {safeFaturamento.totalAberto.toLocaleString(
                              "pt-BR",
                              { style: "currency", currency: "BRL" },
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            color="error.main"
                            fontWeight={500}
                          >
                            {safeFaturamento.totalVencido.toLocaleString(
                              "pt-BR",
                              { style: "currency", currency: "BRL" },
                            )}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {data.porConvenio.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align="center"
                        sx={{ py: 6, color: "text.secondary" }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <FuseSvgIcon size={40} color="action">
                            heroicons-outline:inbox
                          </FuseSvgIcon>
                          <Typography>
                            Nenhum dado encontrado para os filtros aplicados.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
