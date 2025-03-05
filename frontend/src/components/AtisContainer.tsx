import { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Card } from '@mui/material';
import AtisCard from './AtisCard';
import ActiveRwyCard from './ActiveRwyCard';

interface ATIS {
  airport: string
  type: string
  code: string
  datis: string
}

export default function AtisContainer() {
  const [arrivalData, setArrivalData] = useState<ATIS | null>(null);
  const [departureData, setDepartureData] = useState<ATIS | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const refreshInterval = useRef<NodeJS.Timeout | null>(null); // Stores the interval reference

  function getAtis(): Promise<ATIS[]> {
    return fetch('https://datis.clowd.io/api/KCVG')
      .then(res => res.json())
      .then(res => res as ATIS[]);
  }

  const displayAtis = useCallback(() => {
    getAtis()
      .then(data => {
        const arrivalAtis = data.find(atis => atis.type === 'arr');
        if (arrivalAtis) setArrivalData(arrivalAtis);

        const departureAtis = data.find(atis => atis.type === 'dep');
        if (departureAtis) setDepartureData(departureAtis);

        // Update the lastUpdated timestamp
        setLastUpdated(new Date().toLocaleTimeString()); // Formats time as HH:MM:SS AM/PM

        // Reset the auto-refresh timer
        if (refreshInterval.current) clearInterval(refreshInterval.current);
        refreshInterval.current = setInterval(() => {
          displayAtis(); // Auto-refresh every 10 minutes
        }, 600000);
      })
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    displayAtis();

    // Set the initial interval
    refreshInterval.current = setInterval(() => {
      displayAtis();
    }, 600000);

    return () => {
      if (refreshInterval.current) clearInterval(refreshInterval.current); // Cleanup interval on unmount
    };
  }, [displayAtis]);

  return (
    <>
      <Button onClick={displayAtis}>Refresh</Button>
      <Card>Last updated: {lastUpdated}</Card>
      <ActiveRwyCard title='Arrival Runway(s)' pattern='EXPECT (ILS|VISUAL) APPROACH TO (RWY [^.]*)' datis={arrivalData ? arrivalData.datis : 'Loading...'}></ActiveRwyCard>
      <ActiveRwyCard title='Departure Runway(s)' pattern='DEPG (RWY [^.]*)' datis={departureData ? departureData.datis : 'Loading...'}></ActiveRwyCard>
      <AtisCard title='Arrivals' datis={arrivalData ? arrivalData.datis : 'Loading...'} />
      <AtisCard title='Departures' datis={departureData ? departureData.datis : 'Loading...'} />
    </>
  );
}
