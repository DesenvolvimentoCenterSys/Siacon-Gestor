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
import WidgetLoading from "../ui/WidgetLoading";
import { ConveniosDtos } from "@/types/dashboardTypes";

interface TotalFaturamentoPorConvenioWidgetProps {
  initialIsFavorite?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  tab?: DateFilterTab;
  data?: ConveniosDtos[];
  isLoading?: boolean;
}

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
  startDate = null,
  endDate = null,
  tab = "vencimento",
  data = [],
  isLoading = false,
}: TotalFaturamentoPorConvenioWidgetProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (isLoading) return <WidgetLoading height={400} />;

  const rows: ConveniosDtos[] = data || [];

  const periodoText =
    startDate && endDate
      ? `${format(startDate, "dd/MM/yyyy")} a ${format(endDate, "dd/MM/yyyy")}`
      : format(new Date(), "MMM/yyyy", { locale: ptBR });

  const tipoDataLabel = tab === "vencimento" ? "Vencimento" : "Competência";

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
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2, width: "100%" }}>
              {rows.map((item) => (
                <Card
                  key={item.faturamento?.codConvenio ?? item.nomeConvenio}
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
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
                        {item.nomeConvenio ? item.nomeConvenio.charAt(0).toUpperCase() : "?"}
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {item.nomeConvenio || "Sem Nome"}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Qtde Prop: {item.quantidadeProponentes} | Qtde Vidas: {item.quantidadeVidas}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 45, fontWeight: 600 }}>
                        % Total:
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={item.percentual || 0}
                        sx={{
                          flex: 1,
                          height: 10,
                          borderRadius: 999,
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 999,
                            transition: "transform 0.3s ease-in-out",
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        {(item.percentual || 0).toFixed(1)}%
                      </Typography>
                    </Box>

                    <Divider sx={{ mb: 2, borderStyle: "dashed" }} />

                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                      <MetricItem
                        label="Mensalidade"
                        value={item.faturamento?.mensalidade ?? 0}
                        color="text.primary"
                        money
                      />
                      <MetricItem
                        label="Utilização"
                        value={item.faturamento?.utilizacoes ?? 0}
                        color="text.primary"
                        money
                      />
                      <MetricItem
                        label="Ajuste"
                        value={item.faturamento?.ajustes ?? 0}
                        color="text.primary"
                        money
                      />
                      <MetricItem
                        label="Taxa Adm"
                        value={item.faturamento?.taxaAdm ?? 0}
                        color="text.primary"
                        money
                      />
                      <MetricItem
                        label="Total"
                        value={item.totalGeral ?? 0}
                        color="primary.main"
                        money
                        bold
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}

              {rows.length === 0 && (
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
                  <Typography>Nenhum dado encontrado para os filtros aplicados.</Typography>
                </Box>
              )}
            </Box>
          ) : (
            <TableContainer>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "background.paper", py: 2 }}>
                      Convênio
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, bgcolor: "background.paper", py: 2 }}>
                      Qtde Prop.
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, bgcolor: "background.paper", py: 2 }}>
                      Qtde Vidas
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, bgcolor: "background.paper", py: 2, width: 100 }}>
                      Total (%)
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, bgcolor: "background.paper", py: 2 }}>
                      Mensalidade
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, bgcolor: "background.paper", py: 2 }}>
                      Utilização
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, bgcolor: "background.paper", py: 2 }}>
                      Ajuste
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, bgcolor: "background.paper", py: 2 }}>
                      Taxa Adm
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, bgcolor: "background.paper", py: 2 }}>
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows
                    .filter((item) => item.totalGeral !== 0)
                    .map((item) => (
                      <TableRow key={item.faturamento?.codConvenio ?? item.nomeConvenio} hover>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
                              {item.nomeConvenio ? item.nomeConvenio.charAt(0).toUpperCase() : "?"}
                            </Avatar>
                            <Typography variant="body2" fontWeight={500}>
                              {item.nomeConvenio || "Sem Nome"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight={500}>
                            {item.quantidadeProponentes}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight={500}>
                            {item.quantidadeVidas}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={item.percentual || 0}
                              sx={{
                                width: { xs: 70, sm: 90 },
                                height: 8,
                                borderRadius: 999,
                                bgcolor: alpha(theme.palette.primary.main, 0.12),
                                "& .MuiLinearProgress-bar": {
                                  borderRadius: 999,
                                  transition: "transform 0.3s ease-in-out",
                                },
                              }}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                              {(item.percentual || 0).toFixed(1)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={500}>
                            {(item.faturamento?.mensalidade ?? 0).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.primary" fontWeight={500}>
                            {(item.faturamento?.utilizacoes ?? 0).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            {(item.faturamento?.ajustes ?? 0).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            {(item.faturamento?.taxaAdm ?? 0).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={700}>
                            {(item.totalGeral ?? 0).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 6, color: "text.secondary" }}>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                          <FuseSvgIcon size={40} color="action">
                            heroicons-outline:inbox
                          </FuseSvgIcon>
                          <Typography>Nenhum dado encontrado para os filtros aplicados.</Typography>
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