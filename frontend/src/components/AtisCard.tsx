import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export default function AtisCard(props: { title: string, datis: string; }) {
  const card = (
    <React.Fragment>
      <CardContent>
        <Typography gutterBottom sx={{ color: 'text.primary', fontSize: 14 }}>
          {props.title}
        </Typography>
        <Typography variant="body2">
          {props.datis}
        </Typography>
      </CardContent>
    </React.Fragment>
  );
  
  return (
    <Box sx={{ minWidth: 275 }}>
      <Card variant="outlined">{card}</Card>
    </Box>
  );
}