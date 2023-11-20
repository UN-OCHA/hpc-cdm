import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  FormControlLabel,
  Box,
  Button,
  Checkbox,
  Typography,
} from '@mui/material';
import Checkmark from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
interface SetupProcessPropsType {
  selectedStep: string;
  setSelectedStep: (s: string) => void;
}

const processData = [
  {
    id: 'fundingSources',
    description: 'FUNDING SOURCE(S)',
  },
  {
    id: 'fundingDestinations',
    description: 'FUNDING DESTINATIONS',
  },
  {
    id: 'flows',
    description: 'FLOWS',
  },
  {
    id: 'linkedFlows',
    description: 'LINKED FLOWS',
  },
  {
    id: 'reportingDetails',
    description: 'Reporting Details',
  },
];

interface ProcessDataType {
  id: string;
  description: string;
}

export default function SetupProcess({
  selectedStep,
  setSelectedStep,
}: SetupProcessPropsType) {
  const navigate = useNavigate();
  const [completedProcess, setCompletedProcess] = useState<string[]>([]);
  const [uncompletedProcess, setuncompletedProcess] = useState<string[]>([]);

  function handleClickStep(id: string) {
    setSelectedStep(id);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }
  return (
    <Container maxWidth="md">
      <Card variant="outlined">
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            {processData.map(({ id, description }: ProcessDataType) => (
              <FormControlLabel
                key={id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pt: 1,
                  pb: 1,
                  mb: 1,
                  fontWeight: id === selectedStep ? 'bold' : 'normal',
                }}
                control={
                  <Checkbox
                    icon={
                      <RadioButtonUncheckedIcon
                        sx={{
                          width: '20px',
                          height: '20px',
                          color: id === selectedStep ? '#3c4b64' : '#ffa918',
                        }}
                        fontSize="large"
                      />
                    }
                    checkedIcon={
                      <Checkmark
                        sx={{ width: '20px', height: '20px', color: '#30da42' }}
                        fontSize="large"
                      />
                    }
                    checked={completedProcess.includes(id)}
                    onClick={() => handleClickStep(id)}
                  />
                }
                label={
                  <Typography
                    sx={{ fontWeight: id === selectedStep ? 'bold' : 'normal' }}
                  >
                    {description}
                  </Typography>
                }
                labelPlacement="start"
                className={`mb-0 ${id === selectedStep ? 'font-bold' : ''}`}
              />
            ))}
            <Button
              id="traditional"
              type="submit"
              variant="contained"
              color="primary"
              disabled={!(completedProcess.length === 3)}
              fullWidth
            >
              Create
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
