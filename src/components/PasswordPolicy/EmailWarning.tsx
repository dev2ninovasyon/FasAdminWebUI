import { Alert, AlertTitle, Box } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';

const EmailWarning = () => {
  return (
    <Alert 
      severity="info" 
      icon={<InfoOutlined />}
      sx={{ mb: 2 }}
    >
      <AlertTitle>📧 Email Adresi Uyarısı</AlertTitle>
      <Box component="ul" sx={{ pl: 2, m: 0 }}>
        <li>Email adresiniz şifre sıfırlama ve sistem bildirimleri için kullanılacaktır</li>
        <li>Daha sonra değiştirilmesi veya güncellenmesi zor olabilir</li>
        <li>Lütfen geçerli ve erişilebilir bir email adresi girin</li>
        <li>Email adsesinize düzenli olarak erişim sağladığınızdan emin olun</li>
      </Box>
    </Alert>
  );
};

export default EmailWarning;
