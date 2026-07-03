import { useMemo, useState } from "react";
import { useTheme, alpha } from "@mui/material/styles";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tabs,
  Tab,
  Checkbox,
  Popover,
  Skeleton,
  useMediaQuery,
  MenuItem,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { EventAnalyticsDto } from "../../../types/dashboardTypes";
import {
  useEventAnalytics,
  useEventAnalyticsDetails,
  useEventAnalyticsGraphics,
  useEventGroupFilter,
  useToggleFavoriteWidget,
} from "../../hooks/useDashboard";
import useUser from "@auth/useUser";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface EventAnalyticsWidgetProps {
  initialIsFavorite?: boolean;
}

const brl = (v: number) =>
  v?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ?? "R$ 0,00";

interface GradientKPIProps {
  title: string;
  mainValue: string;
  icon: string;
  gradientColors: [string, string];
  children?: React.ReactNode;
  compactSpaces?: boolean;
  dimmed?: boolean;
}

function GradientKPI({
  title,
  mainValue,
  icon,
  gradientColors,
  children,
  compactSpaces,
  dimmed,
}: GradientKPIProps) {
  return (
    <Card
      elevation={3}
      sx={{
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
        color: "white",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        opacity: dimmed ? 0.45 : 1,
        transition:
          "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, opacity 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: (theme: any) => theme.shadows[8],
        },
      }}
    >
      <CardContent
        sx={{
          position: "relative",
          zIndex: 1,
          p: compactSpaces ? 1.5 : { xs: 2, sm: 2.5 },
          "&:last-child": {
            pb: compactSpaces ? 1.5 : { xs: 2, sm: 2.5 },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: compactSpaces ? 0.5 : 1.5,
          }}
        >
          <Typography
            sx={{
              opacity: 0.9,
              fontWeight: 700,
              fontSize: { xs: "1.2rem", sm: "1.3rem", md: "1.4rem" },
              letterSpacing: 0.3,
            }}
          >
            {title}
          </Typography>
          <FuseSvgIcon size={28} sx={{ opacity: 0.3 }}>
            {icon}
          </FuseSvgIcon>
        </Box>

        <Typography
          sx={{
            fontWeight: 800,
            mb: compactSpaces ? 1 : 1.5,
            fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.8rem" },
            lineHeight: 1.1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {mainValue}
        </Typography>

        {children && <Box sx={{ mt: compactSpaces ? 0.5 : 1 }}>{children}</Box>}
      </CardContent>

      <Box
        sx={{
          position: "absolute",
          right: -20,
          bottom: -20,
          width: 110,
          height: 110,
          borderRadius: "50%",
          background: alpha("#ffffff", 0.1),
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          right: 32,
          bottom: 32,
          width: 65,
          height: 65,
          borderRadius: "50%",
          background: alpha("#ffffff", 0.06),
          zIndex: 0,
        }}
      />
    </Card>
  );
}

function KPIMetric({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: { xs: 0.2, md: 0.3 },
        gap: 1,
        minHeight: 0,
      }}
    >
      <Typography
        sx={{ opacity: 0.9, fontWeight: 600, fontSize: { xs: "0.9rem", sm: "1rem", md: "1.2rem" }, flex: 1, minWidth: 0 }}
        noWrap
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontWeight: 700,
          color: valueColor || "inherit",
          fontSize: { xs: "0.9rem", sm: "1rem", md: "1.2rem" },
          textAlign: "right",
          flex: "0 1 auto",
        }}
        noWrap
      >
        {value}
      </Typography>
    </Box>
  );
}

function KPIDivider() {
  return <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.25)", my: 0.75 }} />;
}

interface MiniCardProps {
  title: string;
  value: string | number;
  color: string;
}

function MiniCard({ title, value, color }: MiniCardProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        p: 1.5,
        borderRadius: 2,
        bgcolor: alpha(color, 0.1),
        border: `1px solid ${alpha(color, 0.25)}`,
        height: "100%",
        textAlign: "center",
      }}
    >
      <Typography
        sx={{
          fontWeight: 700,
          color,
          fontSize: { xs: "1.2rem", sm: "1.3rem", md: "1.4rem" },
          lineHeight: 1.2,
          mb: 0.5,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontWeight: 800,
          color,
          fontSize: { xs: "1.4rem", sm: "1.3rem", md: "1.4rem" },
          lineHeight: 1,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

interface MultiCheckFilterProps {
  label: string;
  icon: string;
  options: { code: number; name: string }[];
  selected: number[];
  onChange: (codes: number[]) => void;
}

function MultiCheckFilter({
  label,
  icon,
  options,
  selected,
  onChange,
}: MultiCheckFilterProps) {
  const theme = useTheme();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const open = Boolean(anchor);

  const toggleAll = () => {
    if (selected.length === options.length) onChange([]);
    else onChange(options.map((o) => o.code));
  };

  const toggle = (code: number) => {
    if (selected.includes(code)) onChange(selected.filter((c) => c !== code));
    else onChange([...selected, code]);
  };

  const displayLabel =
    selected.length === 0
      ? `Todos os ${label}`
      : selected.length === 1
        ? options.find((o) => o.code === selected[0])?.name ?? label
        : `${selected.length} selecionados`;

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        onClick={(e) => setAnchor(e.currentTarget)}
        startIcon={<FuseSvgIcon size={16}>{icon}</FuseSvgIcon>}
        endIcon={
          selected.length > 0 ? (
            <Chip
              label={selected.length}
              size="small"
              color="primary"
              sx={{ height: 18, fontSize: "0.65rem", ml: -0.5 }}
            />
          ) : (
            <FuseSvgIcon size={14}>heroicons-solid:chevron-down</FuseSvgIcon>
          )
        }
        sx={{
          borderRadius: "8px",
          textTransform: "none",
          color: selected.length > 0 ? "primary.main" : "text.secondary",
          borderColor: selected.length > 0 ? "primary.main" : "divider",
          minHeight: 40,
          maxWidth: 220,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontSize: "0.9rem",
        }}
      >
        <Typography
          variant="body2"
          noWrap
          sx={{ maxWidth: 140, fontSize: "0.9rem" }}
        >
          {displayLabel}
        </Typography>
      </Button>

      <Popover
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            minWidth: 240,
            maxHeight: 360,
            overflow: "auto",
            boxShadow: theme.shadows[8],
          },
        }}
      >
        <Box sx={{ py: 1 }}>
          <MenuItem onClick={toggleAll} sx={{ py: 0.75, px: 2 }}>
            <Checkbox
              size="small"
              disableRipple 
              checked={selected.length === options.length && options.length > 0}
              indeterminate={selected.length > 0 && selected.length < options.length}
              sx={{
                p: 0, 
                mr: 1.5,
                "& .MuiSvgIcon-root": { fontSize: 22 },
              }}
            />
            <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.95rem" }}>
              Selecionar todos
            </Typography>
          </MenuItem>

          <Divider sx={{ my: 0.5 }} />

          {options.map((o) => (
            <MenuItem key={o.code} onClick={() => toggle(o.code)} sx={{ py: 0.75, px: 2 }}>
              <Checkbox
                size="small"
                disableRipple
                checked={selected.includes(o.code)}
                sx={{
                  p: 0,
                  mr: 1.5,
                  "& .MuiSvgIcon-root": { fontSize: 22 },
                }}
              />
              <Typography variant="body2" sx={{ fontSize: "0.95rem" }}>
                {o.name}
              </Typography>
            </MenuItem>
          ))}

          {options.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ py: 2, textAlign: "center", fontSize: "0.95rem" }}
            >
              Nenhuma opção disponível
            </Typography>
          )}
        </Box>
      </Popover>
    </>
  );
}

interface MobileEventCardProps {
  item: EventAnalyticsDto;
  onSelectEvent: (item: EventAnalyticsDto) => void;
}

function MobileEventCard({ item, onSelectEvent }: MobileEventCardProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        p: 2,
        mb: 1.5,
        bgcolor: "background.paper",
        boxShadow: theme.shadows[1],
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1.5,
        }}
      >
        <Typography
          variant="body1"
          fontWeight={700}
          sx={{ flex: 1, mr: 1, fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" } }}
        >
          {item.nomeEvento}
        </Typography>
        {item.nomeGrupo ? (
          <Chip
            label={item.nomeGrupo}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.secondary.main, 0.1),
              color: theme.palette.secondary.main,
              fontWeight: 600,
              fontSize: { xs: "0.85rem", sm: "1rem", md: "1.2rem" },
            }}
          />
        ) : null}
      </Box>

      <Card
        elevation={2}
        sx={{
          background: "linear-gradient(135deg, #27c52f 0%, #229229 100%)",
          color: "white",
          mb: 1,
          borderRadius: 2,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 }, position: "relative", zIndex: 1 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.1rem", sm: "1.1rem", md: "1.3rem" },
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              opacity: 1,
              mb: 1.5,
            }}
          >
            Faturamento
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: { xs: 1, sm: 0.75 } }}>
            <Box>
              <Typography sx={{ opacity: 0.75, fontSize: { xs: "0.9rem", sm: "0.95rem", md: "1rem" } }}>Total</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: "1rem", sm: "1rem", md: "1.2rem" }, whiteSpace: "nowrap" }}>
                {brl(item.faturamentoEvento.faturamento)}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ opacity: 0.75, fontSize: { xs: "0.9rem", sm: "0.95rem", md: "1rem" } }}>Pago</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: "1rem", sm: "1rem", md: "1.2rem" }, color: "#ffffff", whiteSpace: "nowrap" }}>
                {brl(item.faturamentoEvento.pago)}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ opacity: 0.75, fontSize: { xs: "0.9rem", sm: "0.95rem", md: "1rem" } }}>Aberto</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: "1rem", sm: "1rem", md: "1.2rem" }, color: "#ffffff", whiteSpace: "nowrap" }}>
                {brl(item.faturamentoEvento.aberto)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
        <Box sx={{ position: "absolute", right: -15, bottom: -15, width: 70, height: 70, borderRadius: "50%", background: alpha("#fff", 0.1), zIndex: 0 }} />
      </Card>

      <Card
        elevation={2}
        sx={{
          background: "linear-gradient(135deg, rgb(255, 137, 27) 0%, #eb3f0b 100%)",
          color: "white",
          mb: 1.5,
          borderRadius: 2,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 }, position: "relative", zIndex: 1 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.1rem", sm: "1.1rem", md: "1.3rem" },
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              opacity: 0.9,
              mb: 1.5,
            }}
          >
            Despesas
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: { xs: 1, sm: 0.75 } }}>
            <Box>
              <Typography sx={{ opacity: 0.75, fontSize: { xs: "0.9rem", sm: "0.95rem", md: "1rem" } }}>Total</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: "1rem", sm: "1rem", md: "1.2rem" }, whiteSpace: "nowrap" }}>
                {brl(item.pagamentosEvento.despesas)}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ opacity: 0.75, fontSize: { xs: "0.9rem", sm: "0.95rem", md: "1rem" } }}>Pago</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: "1rem", sm: "1rem", md: "1.2rem" }, color: "#ffffff", whiteSpace: "nowrap" }}>
                {brl(item.pagamentosEvento.pago)}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ opacity: 0.75, fontSize: { xs: "0.9rem", sm: "0.95rem", md: "1rem" } }}>Aberto</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: "1rem", sm: "1rem", md: "1.2rem" }, color: "#ffffff", whiteSpace: "nowrap" }}>
                {brl(item.pagamentosEvento.aberto)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
        <Box sx={{ position: "absolute", right: -15, bottom: -15, width: 70, height: 70, borderRadius: "50%", background: alpha("#fff", 0.1), zIndex: 0 }} />
      </Card>

      <Button
        fullWidth
        variant="contained"
        size="small"
        onClick={() => onSelectEvent(item)}
        startIcon={
          <FuseSvgIcon size={16}>heroicons-outline:magnifying-glass</FuseSvgIcon>
        }
        sx={{
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 700,
          fontSize: "0.95rem",
          py: 1,
          backgroundColor: "#1E1E1E",
        }}
      >
        Ver Detalhamento
      </Button>
    </Box>
  );
}

interface DadosGeraisTabProps {
  data: EventAnalyticsDto[];
  isLoading: boolean;
  onSelectEvent: (item: EventAnalyticsDto) => void;
}

function DadosGeraisTab({ data, isLoading, onSelectEvent }: DadosGeraisTabProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height={isMobile ? 180 : 56} sx={{ mb: 1.5, borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 8,
          gap: 1,
          color: "text.secondary",
        }}
      >
        <FuseSvgIcon size={48} color="action">heroicons-outline:inbox</FuseSvgIcon>
        <Typography variant="body1" sx={{ fontSize: "1rem" }}>
          Nenhum evento encontrado para os filtros selecionados.
        </Typography>
      </Box>
    );
  }

  if (isMobile) {
    return (
      <Box sx={{ p: 2 }}>
        {data.map((item, index) => (
          <MobileEventCard key={index} item={item} onSelectEvent={onSelectEvent} />
        ))}
      </Box>
    );
  }

  return (
    <TableContainer sx={{ overflowX: "auto" }}>
      <Table size="medium" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: 700,
                bgcolor: "background.paper",
                py: 2,
                minWidth: 200,
                fontSize: "1.15rem",
              }}
            >
              Evento
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 700,
                bgcolor: "background.paper",
                py: 2,
                fontSize: "1.15rem",
              }}
            >
              Grupo
            </TableCell>
            <TableCell
              align="right"
              colSpan={3}
              sx={{
                fontWeight: 700,
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                py: 2,
                borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                color: theme.palette.primary.main,
                fontSize: "1.15rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Faturamento
            </TableCell>
            <TableCell
              align="right"
              colSpan={3}
              sx={{
                fontWeight: 700,
                bgcolor: alpha(theme.palette.error.main, 0.05),
                py: 2,
                borderBottom: `2px solid ${alpha(theme.palette.error.main, 0.2)}`,
                color: theme.palette.error.main,
                fontSize: "1.15rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Despesas
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 700,
                bgcolor: "background.paper",
                py: 2,
                fontSize: "1.15rem",
                width: 60,
                minWidth: 60,
                maxWidth: 60,
                textAlign: "center",
              }}
            >
              Ação
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ bgcolor: "background.paper", py: 1.5 }} />
            <TableCell sx={{ bgcolor: "background.paper", py: 1.5 }} />
            {[
              { bg: theme.palette.primary.main, label: "Total", color: "text.secondary" },
              { bg: theme.palette.primary.main, label: "Pago", color: "success.main" },
              { bg: theme.palette.primary.main, label: "Aberto", color: "warning.main" },
              { bg: theme.palette.error.main, label: "Total", color: "text.secondary" },
              { bg: theme.palette.error.main, label: "Pago", color: "success.main" },
              { bg: theme.palette.error.main, label: "Aberto", color: "warning.main" },
            ].map((col, i) => (
              <TableCell
                key={i}
                align="right"
                sx={{
                  fontWeight: 700,
                  bgcolor: alpha(col.bg, 0.04),
                  py: 1.5,
                  fontSize: "1.15rem",
                  color: col.color,
                }}
              >
                {col.label}
              </TableCell>
            ))}
            <TableCell sx={{ bgcolor: "background.paper", py: 1.5, width: 60 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index} hover>
              <TableCell>
                <Typography variant="body1" fontWeight={700} sx={{ fontSize: "1.15rem" }}>
                  {item.nomeEvento}
                </Typography>
              </TableCell>
              <TableCell>
                {item.nomeGrupo ? (
                  <Chip
                    label={item.nomeGrupo}
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      color: theme.palette.secondary.main,
                      fontWeight: 600,
                      fontSize: "1.15rem",
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">—</Typography>
                )}
              </TableCell>
              <TableCell align="right" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                <Typography variant="body1" fontWeight={700} sx={{ fontSize: "1.15rem" }}>
                  {brl(item.faturamentoEvento.faturamento)}
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                <Typography variant="body1" color="success.main" fontWeight={600} sx={{ fontSize: "1.15rem" }}>
                  {brl(item.faturamentoEvento.pago)}
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                <Typography variant="body1" color="warning.main" fontWeight={600} sx={{ fontSize: "1.15rem" }}>
                  {brl(item.faturamentoEvento.aberto)}
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ bgcolor: alpha(theme.palette.error.main, 0.02) }}>
                <Typography variant="body1" fontWeight={700} sx={{ fontSize: "1.15rem" }}>
                  {brl(item.pagamentosEvento.despesas)}
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ bgcolor: alpha(theme.palette.error.main, 0.02) }}>
                <Typography variant="body1" color="success.main" fontWeight={600} sx={{ fontSize: "1.15rem" }}>
                  {brl(item.pagamentosEvento.pago)}
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ bgcolor: alpha(theme.palette.error.main, 0.02) }}>
                <Typography variant="body1" color="warning.main" fontWeight={600} sx={{ fontSize: "1.15rem" }}>
                  {brl(item.pagamentosEvento.aberto)}
                </Typography>
              </TableCell>
              <TableCell sx={{ width: 60, minWidth: 60, maxWidth: 60, textAlign: "center" }}>
                <Tooltip title="Ver detalhamento deste evento" placement="top">
                  <IconButton
                    size="small"
                    onClick={() => onSelectEvent(item)}
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.18),
                        transform: "scale(1.1)",
                      },
                      transition: "all 0.2s",
                      width: 36,
                      height: 36,
                    }}
                  >
                    <FuseSvgIcon size={18} sx={{ color: "primary.main" }}>
                      heroicons-outline:magnifying-glass
                    </FuseSvgIcon>
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

interface DetalhamentoTabProps {
  codEvento: number;
  codGrupo: number | null;
}

function DetalhamentoTab({ codEvento, codGrupo }: DetalhamentoTabProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { data: details, isLoading } = useEventAnalyticsDetails(codEvento, codGrupo, {
    staleTime: 5 * 60 * 1000,
  });
  const { data: graphicsData } = useEventAnalyticsGraphics(codEvento, codGrupo);

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={180} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
        <Skeleton height={300} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (!details) return null;

  const d = details;
  const chartData = (graphicsData ?? []).map((g) => ({
    mes: new Date(g.dDataCompetencia).toLocaleDateString("pt-BR", {
      month: "2-digit",
      year: "2-digit",
    }),
    Receita: g.valorReceita ?? 0,
    Despesa: g.valorDespesa ?? 0,
  }));

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: "1.3rem", md: "1.3rem" } }}>
          {d.nomeEvento}
        </Typography>
        {d.nomeGrupo && (
          <Chip
            label={d.nomeGrupo}
            size="small"
            sx={{
              mt: 0.5,
              bgcolor: alpha(theme.palette.secondary.main, 0.1),
              color: theme.palette.secondary.main,
              fontWeight: 600,
              fontSize: { xs: "1.3rem", sm: "1.2rem" },
              height: { xs: 28, sm: 24 },
            }}
          />
        )}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(4, 1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
          <MiniCard title="Participantes" value={d.participantes} color="#0288d1" />
          <MiniCard title="Qtd. Vendas" value={d.quantidadeVenda} color="#0288d1" />
          <MiniCard title="Associados" value={d.associados} color="#0288d1" />
          <MiniCard title="Não Assoc." value={d.naoAssociados} color="#0288d1" />
        </Box>

        <GradientKPI
          title="Faturamento Detalhado"
          mainValue={brl(d.faturamentoEventoDetalhado.totalFaturamento)}
          icon="heroicons-outline:currency-dollar"
          gradientColors={["#19c922", "#229229"]}
          compactSpaces={true}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <KPIMetric label="Venda" value={brl(d.faturamentoEventoDetalhado.venda)} />
            <KPIMetric label="Entrada Manual" value={brl(d.faturamentoEventoDetalhado.entradaManual)} />
            <KPIMetric label="A Vencer" value={brl(d.faturamentoEventoDetalhado.aVencer)} valueColor="#ffffff" />
            <KPIMetric label="Vencido" value={brl(d.faturamentoEventoDetalhado.vencido)} valueColor="#ffffff" />
            <KPIDivider />
            <KPIMetric label="Liquidado" value={brl(d.faturamentoEventoDetalhado.liquidado)} valueColor="#ffffff" />
          </Box>
        </GradientKPI>

        <GradientKPI
          title="Despesas Detalhadas"
          mainValue={brl(d.despesaEventoDetalhado.totalDespesa)}
          icon="heroicons-outline:document-text"
          gradientColors={["#fa780d", "#f04816"]}
          compactSpaces={true}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <KPIMetric label="Em Aberto" value={brl(d.despesaEventoDetalhado.emAberto)} valueColor="#ffffff" />
            <KPIDivider />
            <KPIMetric label="Liquidado" value={brl(d.despesaEventoDetalhado.liquidado)} valueColor="#ffffff" />
          </Box>
        </GradientKPI>

        <GradientKPI
          title="Resultado"
          mainValue={brl(d.resultadoEventoDetalhado.realizado)}
          icon="heroicons-outline:scale"
          gradientColors={["#1565C0", "#0D47A1"]}
          compactSpaces={true}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <KPIMetric label="Previsto" value={brl(d.resultadoEventoDetalhado.previsto)} />
          </Box>
        </GradientKPI>
      </Box>

      <Box
        sx={{
          p: { xs: 1.5, md: 2 },
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, fontSize: { xs: "1.3rem", sm: "1.5rem" } }}>
          Receitas vs Despesas
        </Typography>
        <ResponsiveContainer width="100%" height={isMobile ? 320 : 280}>
          <BarChart
            data={chartData}
            layout={isMobile ? "vertical" : "horizontal"}
            margin={
              isMobile
                ? { top: 4, right: 60, left: 8, bottom: 4 }
                : { top: 4, right: 16, left: 8, bottom: 16 }
            }
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={alpha(theme.palette.divider, 0.6)}
              horizontal={!isMobile}
              vertical={isMobile}
            />
            {isMobile ? (
              <>
                <YAxis
                  dataKey="mes"
                  type="category"
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  width={55}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                  tickFormatter={(v) =>
                    v >= 1000000
                      ? `R$${(v / 1000000).toFixed(1)}M`
                      : v >= 1000
                        ? `R$${(v / 1000).toFixed(0)}k`
                        : String(v)
                  }
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 13, fill: theme.palette.text.secondary }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                />
              </>
            )}
            <RechartsTooltip
              formatter={(value: number, name: string) => [brl(value), name]}
              contentStyle={{
                borderRadius: 8,
                border: `1px solid ${theme.palette.divider}`,
                fontSize: 13,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 13, fontWeight: 600 }} />
            <Bar
              dataKey="Receita"
              fill="#23a329"
              radius={isMobile ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              label={
                isMobile
                  ? {
                      position: "right",
                      fontSize: 10,
                      fontWeight: 700,
                      fill: "#444",
                      formatter: (v: number) =>
                        v >= 1000000
                          ? `${(v / 1000000).toFixed(1)}M`
                          : v >= 1000
                            ? `${(v / 1000).toFixed(0)}k`
                            : String(v),
                    }
                  : undefined
              }
            />
            <Bar
              dataKey="Despesa"
              fill="#fa600d"
              radius={isMobile ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              label={
                isMobile
                  ? {
                      position: "right",
                      fontSize: 10,
                      fontWeight: 700,
                      fill: "#444",
                      formatter: (v: number) =>
                        v >= 1000000
                          ? `${(v / 1000000).toFixed(1)}M`
                          : v >= 1000
                            ? `${(v / 1000).toFixed(0)}k`
                            : String(v),
                    }
                  : undefined
              }
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

export function EventAnalyticsWidget({
  initialIsFavorite = false,
}: EventAnalyticsWidgetProps) {
  const theme = useTheme();
  const { data: user } = useUser();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<EventAnalyticsDto | null>(null);

  const [selectedEventos, setSelectedEventos] = useState<number[]>([]);
  const [selectedGrupos, setSelectedGrupos] = useState<number[]>([]);
  const [appliedEventos, setAppliedEventos] = useState<number[]>([]);
  const [appliedGrupos, setAppliedGrupos] = useState<number[]>([]);

  const { data: filterOptions } = useEventGroupFilter();
  const { data: widgetData, isLoading: isLoadingData } = useEventAnalytics(
    appliedEventos,
    appliedGrupos,
  );


  const handleSearch = () => {
    setAppliedEventos(selectedEventos);
    setAppliedGrupos(selectedGrupos);
    setSelectedEvent(null);
    setActiveTab(0);
  };
  const handleSelectEvent = (item: EventAnalyticsDto) => {
    setSelectedEvent(item);
    setActiveTab(1);
  };
  const eventoOptions = useMemo(
    () =>
      (filterOptions?.eventos ?? []).map((e) => ({
        code: e.codEvento,
        name: e.nomeEvento ?? "",
      })),
    [filterOptions],
  );
  const grupoOptions = useMemo(
    () =>
      (filterOptions?.grupos ?? []).map((g) => ({
        code: g.codGrupo,
        name: g.nomeGrupo ?? "",
      })),
    [filterOptions],
  );
  const data = widgetData ?? [];

  const totalFaturamento = useMemo(
    () => data.reduce((s, i) => s + (i.faturamentoEvento.faturamento ?? 0), 0),
    [data],
  );
  const totalDespesas = useMemo(
    () => data.reduce((s, i) => s + (i.pagamentosEvento.despesas ?? 0), 0),
    [data],
  );
  const totalPago = useMemo(
    () => data.reduce((s, i) => s + (i.faturamentoEvento.pago ?? 0), 0),
    [data],
  );
  const totalResultado = useMemo(
    () => totalFaturamento - totalDespesas,
    [totalFaturamento, totalDespesas],
  );

  return (
    <Card
      elevation={0}
      sx={{
        height: { xs: "auto", md: "100%" },
        width: "100%",
        border: `1px solid ${theme.palette.divider}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ p: { xs: 2, md: 3 }, pb: 0, flexShrink: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: "1.1rem", md: "1.35rem" } }}>
              Análise de Eventos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "1rem", md: "1.1rem" } }}>
              Performance financeira por evento e grupo
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
            mb: 2,
          }}
        >
          <MultiCheckFilter
            label="Eventos"
            icon="heroicons-outline:ticket"
            options={eventoOptions}
            selected={selectedEventos}
            onChange={setSelectedEventos}
          />

          <MultiCheckFilter
            label="Grupos"
            icon="heroicons-outline:user-group"
            options={grupoOptions}
            selected={selectedGrupos}
            onChange={setSelectedGrupos}
          />

          <Button
            variant="contained"
            size="small"
            onClick={handleSearch}
            startIcon={<FuseSvgIcon size={16}>heroicons-outline:magnifying-glass</FuseSvgIcon>}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              width: { xs: "100%", sm: "auto" },
              minHeight: 40,
              px: 2,
              fontWeight: 700,
              fontSize: "1.2rem",
              backgroundColor: "#1E1E1E",
            }}
          >
            Pesquisar
          </Button>

          {(appliedEventos.length > 0 || appliedGrupos.length > 0) && (
            <Button
              variant="text"
              size="small"
              onClick={() => {
                setSelectedEventos([]);
                setSelectedGrupos([]);
                setAppliedEventos([]);
                setAppliedGrupos([]);
                setSelectedEvent(null);
                setActiveTab(0);
              }}
              sx={{
                textTransform: "none",
                color: "text.secondary",
                minHeight: 40,
                fontSize: "1.2rem",
              }}
            >
              Limpar filtros
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, flexShrink: 0 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            px: { xs: 1, sm: 1.5, md: 2 },
            minHeight: 48,
            "& .MuiTab-root": {
              minHeight: 48,
              textTransform: "none",
              fontWeight: 700,
              fontSize: { xs: "0.95rem", sm: "1rem", md: "1.2rem" },
              flex: { xs: "1", md: "auto" },
            },
          }}
        >
          <Tab label="Dados Gerais" value={0} />
          <Tab
            label={selectedEvent ? selectedEvent.nomeEvento : "Detalhamento Evento"}
            sx={{
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
            value={1}
            disabled={!selectedEvent}
          />
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", bgcolor: alpha(theme.palette.background.default, 0.2) }}>
        {activeTab === 0 && (
          <>
            {data.length > 0 && (
              <Box
                sx={{
                  px: { xs: 1.5, sm: 2, md: 3 },
                  py: { xs: 1.5, md: 2 },
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
                  gap: { xs: 1, sm: 1.5, md: 2 },
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <GradientKPI
                  title="Faturamento Total"
                  mainValue={brl(totalFaturamento)}
                  icon="heroicons-outline:currency-dollar"
                  gradientColors={["#23a329", "#229229"]}
                />
                <GradientKPI
                  title="Receitas Pagas"
                  mainValue={brl(totalPago)}
                  icon="heroicons-outline:check-circle"
                  gradientColors={["#e9a81b", "#da9500"]}
                />
                <GradientKPI
                  title="Total Despesas"
                  mainValue={brl(totalDespesas)}
                  icon="heroicons-outline:document-text"
                  gradientColors={["#fa600d", "#f04816"]}
                />
                <GradientKPI
                  title="Resultado"
                  mainValue={brl(totalResultado)}
                  icon="heroicons-outline:scale"
                  gradientColors={["#1565C0", "#0D47A1"]}
                />
              </Box>
            )}
            <DadosGeraisTab
              data={data}
              isLoading={isLoadingData}
              onSelectEvent={handleSelectEvent}
            />
          </>
        )}

        {activeTab === 1 && selectedEvent && (
          <DetalhamentoTab
            key={selectedEvent.codEvento}
            codEvento={selectedEvent.codEvento}
            codGrupo={selectedEvent.codGrupo}
          />
        )}
      </Box>
    </Card>
  );
}