import { Box, Typography, LinearProgress } from '@mui/material'
import HubIcon from '@mui/icons-material/Hub'

interface SplashScreenProps {
  exiting: boolean
}

export function SplashScreen({ exiting }: SplashScreenProps) {
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        bgcolor: '#0B1628',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        opacity: exiting ? 0 : 1,
        transition: 'opacity 0.4s ease',
        userSelect: 'none',
      }}
    >
      <Box
        sx={{
          width: 88,
          height: 88,
          borderRadius: '22px',
          background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          mb: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.40)',
          animation: 'spin 8s linear infinite',
          '@keyframes spin': {
            from: { transform: 'rotate(0deg)' },
            to: { transform: 'rotate(360deg)' },
          },
        }}
      >
        <HubIcon sx={{ fontSize: 48 }} />
      </Box>

      <Typography
        variant="h5"
        sx={{ color: '#E2E8F0', fontWeight: 900, letterSpacing: 0.5, mb: 0.75 }}
      >
        k8s Learn
      </Typography>
      <Typography
        sx={{ color: '#94A3B8', fontSize: 13, mb: 5 }}
      >
        Kubernetes 学習ツール
      </Typography>

      <LinearProgress
        sx={{
          width: 160,
          height: 3,
          borderRadius: 999,
          bgcolor: 'rgba(148,163,184,0.14)',
          '& .MuiLinearProgress-bar': { borderRadius: 999, bgcolor: '#3B82F6' },
        }}
      />
    </Box>
  )
}
