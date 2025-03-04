import React from 'react';
import { Modal, Box, Typography, IconButton } from '@mui/material';
import { IoClose } from 'react-icons/io5';
import { format } from "date-fns";

interface Asset {
  logo: string;
  name: string;
  symbol: string;
  amount: string;
  buyPrice: string;
  date: string;
  fee: string;
  notes: string;
}

interface AssetDetailsProps {
  showAssetDetails: boolean;
  setShowAssetDetails: React.Dispatch<React.SetStateAction<boolean>>;
  selectedAsset: Asset | null;
}

const formatDate = (date: string) => {
      return format(new Date(date), "MMMM dd, yyyy");
};

const AssetDetails = ({ showAssetDetails, setShowAssetDetails, selectedAsset }: AssetDetailsProps) => {
  return (
    <Modal open={showAssetDetails} onClose={() => setShowAssetDetails(false)}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 50,
          p: 4,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          border: '1px solid #ccc',
        }}
      >
        {selectedAsset && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <img
                  src={selectedAsset.logo}
                  alt={selectedAsset.name}
                  width={30}
                  height={30}
                  style={{ borderRadius: '50%' }}
                />
                <Typography variant="h6">
                  {selectedAsset.name} ({selectedAsset.symbol})
                </Typography>
              </Box>
              <IconButton onClick={() => setShowAssetDetails(false)}>
                <IoClose size={24} />
              </IconButton>
            </Box>

            <Box sx={{ display: 'grid', gap: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>
                  <strong>Amount:</strong>
                </Typography>
                <Typography>{selectedAsset.amount}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>
                  <strong>Buy Price:</strong>
                </Typography>
                <Typography>${selectedAsset.buyPrice}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>
                  <strong>Total Spent:</strong>
                </Typography>
                <Typography>
                  ${(
                    parseFloat(selectedAsset.buyPrice) * parseFloat(selectedAsset.amount) +
                    parseFloat(selectedAsset.fee)
                  ).toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>
                  <strong>Date:</strong>
                </Typography>
                <Typography>{formatDate(selectedAsset.date)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>
                  <strong>Fee:</strong>
                </Typography>
                <Typography>${selectedAsset.fee}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>
                  <strong>Notes:</strong>
                </Typography>
                <Typography>{selectedAsset.notes}</Typography>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default AssetDetails;