import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  direction: 'rtl',
  typography: {
    color: '#3a256d',
    fontFamily: `'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif`,
  },
  palette: {
    secondary: {
      main: '#8b7bda',       // כאן מגדירים את הצבע שאת רוצה במקום הסגול הדיפולטי
      contrastText: '#ffffff', // צבע טקסט מעליו
    },
  },
  components: {
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        color: 'secondary', // כל TextField כברירת מחדל יהיה בצבע secondary
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          height: '37px ',
          fontSize: '0.875rem',
          backgroundColor: 'rgba(255, 255, 255, 0.8) !important',
          '& input:-webkit-autofill': {
            boxShadow: '0 0 0 1000px rgba(255, 255, 255, 0.8) inset !important',
            WebkitTextFillColor: '#000', // או כל צבע טקסט שתרצי
          },
          '& fieldset': {
            borderColor: '#d3a6ec', // גבול רגיל
          },
          '&:hover fieldset': {
            borderColor: '#bca8f0', // בהובר
          },
          '&.Mui-focused fieldset': {
            borderColor: '#8b7bda', // בפוקוס
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--bgSoft)',
            boxShadow: '0px 0px 5px rgba(0, 123, 255, 0.5)',
          },
          '&.Mui-focused': {
            outline: 'none',
          },
          '& .MuiOutlinedInput-input': {
            height: '4px ',
            fontSize: '0.875rem',
            backgroundColor: 'rgba(0, 0, 0, 0) !important',
          }
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {

          '&.MuiInputLabel-shrink': {
            color: '#3a256d !important', // תווית כשהיא למעלה (בשדה מלא)
          },
        },

      },
    },

    MuiInputBase: {
      styleOverrides: {
        input: {
          '&:focus': {
            outline: 'none',
            boxShadow: 'none',
          },
        },
      },
    },
  },
});

export default theme;
