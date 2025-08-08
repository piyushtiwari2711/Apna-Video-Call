import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';



// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function Authentication() {

    

    const [username, setUsername] = React.useState();
    const [password, setPassword] = React.useState();
    const [name, setName] = React.useState();
    const [error, setError] = React.useState();
    const [message, setMessage] = React.useState();


    const [formState, setFormState] = React.useState(0);

    const [open, setOpen] = React.useState(false)


    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    let handleAuth = async () => {
        try {
            if (formState === 0) {

                let result = await handleLogin(username, password)


            }
            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                console.log(result);
                setUsername("");
                setMessage(result);
                setOpen(true);
                setError("")
                setFormState(0)
                setPassword("")
            }
        } catch (err) {

            console.log(err);
            let message = (err.response.data.message);
            setError(message);
        }
    }


    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={5}
                    md={7}
                    sx={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=1400&q=80')",
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) =>
                            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: { xs: 'none', sm: 'block' },
                        transition: 'background-image 0.5s ease',
                    }}
                />
                <Grid item xs={12} sm={7} md={5} component={Paper} elevation={8} square sx={{ background: 'rgba(255,255,255,0.98)' }}>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                            {/* <img
                                // src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80"
                                // alt="Video call illustration"
                                style={{ width: 120, height: 120, borderRadius: 16, objectFit: 'cover', marginBottom: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}
                            /> */}
                            <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60 }}>
                                <LockOutlinedIcon fontSize="large" />
                            </Avatar>
                        </Box>
                        <Typography component="h1" variant="h4" sx={{ fontWeight: 700, color: '#1976d2', mb: 1.2, letterSpacing: 1 }}>
                            Apna Video Call
                        </Typography>
                        <Typography variant="subtitle1" sx={{ color: '#444', mb: 2, fontWeight: 500, letterSpacing: 0.5 }}>
                            Connect. Collaborate. Celebrate.
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#888', mb: 3, fontStyle: 'italic', textAlign: 'center', maxWidth: 340 }}>
                            "Bringing people closer, no matter the distance. Start your journey with seamless video calls."
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Button variant={formState === 0 ? "contained" : "outlined"} color="primary" size="large" sx={{ fontWeight: 600, borderRadius: 2 }} onClick={() => { setFormState(0) }}>
                                Sign In
                            </Button>
                            <Button variant={formState === 1 ? "contained" : "outlined"} color="primary" size="large" sx={{ fontWeight: 600, borderRadius: 2 }} onClick={() => { setFormState(1) }}>
                                Sign Up
                            </Button>
                        </Box>
                        <Box component="form" noValidate sx={{ mt: 1, width: '100%', maxWidth: 400 }}>
                            {formState === 1 && (
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="fullname"
                                    label="Full Name"
                                    name="fullname"
                                    value={name}
                                    autoFocus
                                    onChange={(e) => setName(e.target.value)}
                                />
                            )}
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                value={username}
                                autoFocus={formState === 0}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                value={password}
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}
                                id="password"
                            />
                            {error && <Typography sx={{ color: 'red', mt: 1, fontWeight: 500 }}>{error}</Typography>}
                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                color="primary"
                                size="large"
                                sx={{ mt: 3, mb: 2, fontWeight: 600, borderRadius: 2, fontSize: 18, py: 1.2 }}
                                onClick={handleAuth}
                            >
                                {formState === 0 ? "Login" : "Register"}
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            <Snackbar
                open={open}
                autoHideDuration={4000}
                message={message}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                ContentProps={{ sx: { fontWeight: 600, fontSize: 16, color: '#1976d2', background: '#fff', border: '1px solid #1976d2' } }}
            />
        </ThemeProvider>
    );
}