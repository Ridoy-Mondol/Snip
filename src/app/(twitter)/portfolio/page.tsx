"use client"
import { useState, useEffect, useContext, useRef } from "react"
import { Box, Button, Typography, Modal, TextField, Paper, List, ListItem, ListItemText, InputAdornment, IconButton, TableContainer, Table, TableBody, TableRow, TableCell, TableHead, Avatar, useTheme } from "@mui/material";
import { RiMoneyDollarCircleLine, RiAddCircleLine, RiCloseLine } from "react-icons/ri";
import { AiOutlineDollar } from "react-icons/ai";
import { BsChevronDown } from "react-icons/bs"; 
import { FaBitcoin, FaPlus, FaCaretUp, FaTh } from 'react-icons/fa';
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { useSpring, animated } from '@react-spring/web';

import { AuthContext } from "@/context/AuthContext";
import { CoinGeckoClient } from "@/utilities/coingeckoclient";
import CircularLoading from "@/components/misc/CircularLoading";
import CustomSnackbar from "@/components/misc/CustomSnackbar";
import { SnackbarProps } from "@/types/SnackbarProps";
import PortfolioChart from "@/components/chart/PortfolioChart"
import PortfolioAction from "@/components/modals/PortfolioAction";
import AssetDetails from "@/components/modals/AssetDetails";

interface CryptoAsset {
    id: string;
    name: string;
    symbol: string;
    rank: number;
    currentPrice: string;
    priceChange1h: string;
    priceChange24h: string;
    priceChange7d: string;
    priceChange30d: string;
    volume24h: string;
    circulatingSupply: string;
    totalSupply: string;
    marketCap: string;
    logoUrl: string;
    priceHistory: number[];
}

interface Asset {
  id: string;
  name: string;
  amount: string;
  buyPrice: string;
  date: string;
  fee: string;
  notes: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    name: string;
    photoUrl: string;
    isPremium: boolean;
    description: string;
  };
  symbol: string;
  logo: string;
}

interface AssetWithValue {
  name: string;
  value: number;
}

const cache = new Map();
const cache24h = new Map();
const fetchHistoricalData = async (range: string, assets: any[], getAllAssetNames: Function) => {
  const allAssets = getAllAssetNames(assets);

  const cacheKey = `${range}-${allAssets.map((asset: AssetWithValue) => asset.name).join('-')}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const historicalData = [];
  try {
    const days = range === "24h" ? "1" : range === "7d" ? "7" : range === "30d" ? "30" : "1";

    for (const assetName of allAssets) {
      const asset = assets.find(a => a.name === assetName);
      if (!asset) continue;

      if (range === "1h" && cache24h.has(asset.name)) {
        const oneHourAgo = Math.floor(Date.now() / 1000) - 3600;
        const cachedPrices = cache24h.get(asset.name);
        const prices = cachedPrices.filter((point: any) => point.time >= oneHourAgo);

        cache.set(cacheKey, prices);
        historicalData.push({ name: asset.name, prices });
        continue;
      }

      const response = await fetch(
        `/api/auth/coingecko?coin=${asset.name.toLowerCase()}&days=${days}`
      );

      const data = await response.json();

      let prices = data.prices.map(([timestamp, price]: [number, number]) => ({
        time: Math.floor(timestamp / 1000),
        value: price,
      }));

      if (range === "24h") {
        cache24h.set(asset.name, prices);
      }

      historicalData.push({ name: asset.name, prices });
    }

    const portfolioValuesOverTime = calculatePortfolioValuesOverTime(historicalData, assets);

    cache.set(cacheKey, portfolioValuesOverTime);
    return portfolioValuesOverTime;
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return [];
  }
};


const findClosestPrice = (prices: any[], timestamp: number) => {
  return prices.reduce((prev, curr) => 
    Math.abs(curr.time - timestamp) < Math.abs(prev.time - timestamp) ? curr : prev
  );
};


const calculatePortfolioValuesOverTime = (historicalData: any[], assets: any[]) => {
  const portfolioValues: any[] = [];

  const allTimestamps = new Set<number>();
  historicalData.forEach((assetData) => {
    assetData.prices.forEach((point: any) => {
      allTimestamps.add(point.time);
    });
  });

  const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

  sortedTimestamps.forEach((timestamp) => {
    let totalPortfolioValue = 0;

    historicalData.forEach((assetData) => {
      const closestPrice = findClosestPrice(assetData.prices, timestamp);
      if (closestPrice) {
        const asset = assets.find((a) => a.name === assetData.name);
        if (asset) {
          totalPortfolioValue += closestPrice.value * parseFloat(asset.amount);
        }
      }
    });

    portfolioValues.push({ time: timestamp, value: totalPortfolioValue });
  });

  return portfolioValues;
};

const Portfolio = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>([]);
  const [availableAssets, setAvailableAssets] = useState<CryptoAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<CryptoAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAssetDetails, setShowAssetDetails] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [coin, setCoin] = useState("");
  const [quantity, setQuantity] = useState<string>("");
  const [pricePerCoin, setPricePerCoin] = useState<string>("");
  const [totalSpent, setTotalSpent] = useState(0);
  const [fees, setFees] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);
  const [timePeriod, setTimePeriod] = useState<string>('24h');
  const [loading, setLoading] = useState(false);
  const [graphLoading, setGraphLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarProps>({ message: "", severity: "success", open: false });
  const [chartData, setChartData] = useState([]);

  const { token } = useContext(AuthContext);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchAssets = async (userId: string) => {
    setLoading(true);
     try {
        const response = await fetch("/api/assets/fetch", {
            method: "GET",
            headers: {
                "userId": userId,
            }
        })

        if (!response.ok) {
          setLoading(false);
        }

        const data = await response.json();
        if (data.success) {
            setLoading(false);
            setAssets(data.assets);
        } else {
            setLoading(false);
        }
     } catch(error) {
        setLoading(false);
        console.error("Failed to fetch assets");
     }
  }

  const fetchCryptoData = async () => {
    setLoading(true);
     try {
        const marketData = await CoinGeckoClient.coinsMarkets({
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: 100,
            page: 1,
            sparkline: true,
            price_change_percentage: "1h,24h,7d,30d",
        });

        const updatedAssets: CryptoAsset[] = marketData.map((priceData: any) => ({
            id: priceData.id,
            name: priceData.name,
            symbol: priceData.symbol.toUpperCase(),
            rank: priceData.market_cap_rank,
            currentPrice: priceData.current_price.toLocaleString(),
            priceChange1h: priceData.price_change_percentage_1h_in_currency?.toFixed(2) || "0",
            priceChange24h: priceData.price_change_percentage_24h_in_currency?.toFixed(2) || "0",
            priceChange7d: priceData.price_change_percentage_7d_in_currency?.toFixed(2) || "0",
            priceChange30d: priceData.price_change_percentage_30d_in_currency?.toFixed(2) || "0",
            volume24h: priceData.total_volume?.toLocaleString() || "0",
            circulatingSupply: priceData.circulating_supply?.toLocaleString() || "0",
            totalSupply: priceData.total_supply?.toLocaleString() || "0",
            marketCap: priceData.market_cap?.toLocaleString() || "0",
            logoUrl: priceData.image || "",
            priceHistory: priceData.sparkline_in_7d.price,
        }))
        setLoading(false);
        setCryptoAssets(updatedAssets);
     } catch(error) {
        setLoading(false);
        console.error("Error fetching crypto data:", error);
     }
  }

  useEffect(() => {
    if (token) {
      fetchAssets(token.id);
    }
    fetchCryptoData();
  }, [token]);

  const dropdownAnimation = useSpring({
    opacity: showDropdown ? 1 : 0,
    transform: showDropdown ? "translateY(0px)" : "translateY(-10px)",
    config: { tension: 200, friction: 20 },
  });

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const relatedTarget = event.relatedTarget as HTMLElement | null;
    if (relatedTarget && dropdownRef.current?.contains(relatedTarget)) {
      return;
    }
    const isCoinExist = cryptoAssets.some(
      (asset) =>
        asset.name.toLowerCase() === coin.toLowerCase() || 
        asset.symbol.toLowerCase() === coin.toLowerCase()
    );

    const isSymbolExist = cryptoAssets.some(
      (asset) =>
        asset.symbol.toLowerCase() === coin.toLowerCase()
    );
    if (!isCoinExist) {
      setCoin("");
      setPricePerCoin("");
    }
    if(isSymbolExist) {
      const matchingAsset = cryptoAssets.find(
        (asset) => asset.symbol.toLowerCase() === coin.toLowerCase()
      );
      matchingAsset && setCoin(matchingAsset.name);
    }
    setShowDropdown(false);
  };

  const handleSelectCoin = (coinName: string, price: string) => {
    setCoin(coinName);
    if (coinName && price) {
    setPricePerCoin(price);
    }
    setTimeout(() => setShowDropdown(false), 100);
  };

  useEffect(() => {
    const existingCoinNames = new Set(assets.map(asset => asset.name.toLowerCase()));

    const filteredCryptoAssets = cryptoAssets.filter(asset => 
        !existingCoinNames.has(asset.name.toLowerCase())
    );

    setAvailableAssets(filteredCryptoAssets);
}, [cryptoAssets, assets]); 

  useEffect(() => {
      if (coin.trim() === "") {
        setFilteredAssets(availableAssets);
      } else {
        const filtered = availableAssets.filter((asset) =>
          asset.name.toLowerCase().includes(coin.toLowerCase()) ||
          asset.symbol.toLowerCase().includes(coin.toLowerCase())
        );
        setFilteredAssets(filtered);
      }
    }, [coin, availableAssets]);

    useEffect(() => {
       if (quantity && pricePerCoin) {
        const priceWithoutCommas = pricePerCoin.replace(/,/g, "");
        const parsedQuantity = parseFloat(quantity);
        const parsedPrice = parseFloat(priceWithoutCommas);
        setTotalSpent(parsedQuantity * parsedPrice);
       } else {
        setTotalSpent(0);
       }
    },[quantity, pricePerCoin])

    const handleSubmit = async () => {
        if (!coin || !quantity || !pricePerCoin) {
          return;
        }
        setLoading(true);
        try {
           const response = await fetch("/api/assets/create", {
             method: "POST",
             body: JSON.stringify({
              name: coin, 
              amount: parseFloat(quantity), 
              buyPrice: parseFloat(pricePerCoin),
              fee: fees ? parseFloat(fees) : 0, 
              notes: notes || null, 
              authorId: token?.id
             }),
           })
           if (!response.ok) {
              setLoading(false);
              setSnackbar({
                message: "Something went wrong!",
                severity: "error",
                open: true,
             });
           }
           const data = await response.json();
           if (data.success) {
             setLoading(false);
             setShowAssetForm(false);
             setSnackbar({
              message: "Asset added successfully",
              severity: "success",
              open: true,
            });
             window.location.reload();
           } else {
             setLoading(false);
             setSnackbar({
              message: "Something went wrong!",
              severity: "error",
              open: true,
           });
           }
        } catch(e) {
          setLoading(false);
          setSnackbar({
            message: "Something went wrong!",
            severity: "error",
            open: true,
         });
        }
    }

    const totalPortfolioValue = assets.reduce((total, a) => {
      const matching = cryptoAssets.find((crypto) => crypto.name === a.name);
      const price = matching ? matching.currentPrice : '0';
      const cleanedPrice = price.replace(",", "");
      return total + parseFloat(cleanedPrice) * parseFloat(a.amount);
    }, 0);

    const calculatePortfolioChange = (period: string) => {
      const portfolioValueChange = assets.reduce((totalChange, a) => {
        const matching = cryptoAssets.find((crypto) => crypto.name === a.name);
        if (matching) {
          const currentPrice = parseFloat(matching.currentPrice.replace(",", ""));
          const priceChange = parseFloat(matching[`priceChange${period}` as keyof CryptoAsset] as string);
          const changeAmount = currentPrice * (priceChange / 100) * parseFloat(a.amount);
          return totalChange + changeAmount;
        } else {
          return totalChange;
        }
      }, 0);
  
      const portfolioPercentageChange = (portfolioValueChange / totalPortfolioValue) * 100;
  
      return { portfolioValueChange, portfolioPercentageChange };
    };
  
    const { portfolioValueChange, portfolioPercentageChange } = calculatePortfolioChange(timePeriod); 

    const getAllAssetNames = () => {
      return assets.map(asset => asset.name);
    };    
    
    useEffect(() => {
      if (assets.length > 0) {
        const fetchData = async () => {
          setGraphLoading(true);
          const portfolioValueOverTime = await fetchHistoricalData(timePeriod, assets, getAllAssetNames);
          setChartData(portfolioValueOverTime);
          setGraphLoading(false);
        };
    
        fetchData();
      }
    }, [timePeriod, assets]);


    const handleRowClick = (asset: any) => {
      setSelectedAsset(asset);
      setShowAssetDetails(true);
    };

    const getTextColor = (percentage: number) => {
      const value = percentage;
      if (value < 0) {
        return "red";
      } else if (value > 0) {
        return "green";
      }
      return "gray"; 
    };

    const handleLoadingChange = (value: boolean): void => {
      setLoading(value);
    };

    if (loading) {
      return <CircularLoading />;
    }

    return (
      <div>
      { assets.length === 0 ? (
      <Box 
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="70vh"
      textAlign="center"
    >
      {/* Illustration */}
      <img 
        src="/assets/portfolio.webp"
        alt="No Assets"
        width={400} 
        style={{ maxWidth: "100%", height: "auto" }}
      />

      {/* Heading */}
      <Typography 
        variant="h4" 
        fontWeight="bold"  
        display="flex" 
        alignItems="center" 
        gap={1}
      >
        <RiMoneyDollarCircleLine size={36} color="#3f51b5" />
        No Assets Found
      </Typography>

      {/* Description */}
      <Typography 
        variant="body1" 
        color="textSecondary" 
        mt={1} 
        px={3}
      >
        Start tracking your crypto portfolio by adding your first asset.
      </Typography>

      {/* Add Asset Button */}
      <Button
        variant="contained"
        startIcon={<RiAddCircleLine />}
        sx={{ 
          mt: 3, 
          px: 4, 
          py: 1.2, 
          fontSize: "1rem", 
          borderRadius: 2,
          color: "#FFFFFF",
          background: "linear-gradient(135deg, #3f51b5 0%, #1e88e5 100%)"
        }}
        onClick={() => setShowAssetForm(true)}
      >
        Add Asset
      </Button>
    </Box>
   ) : (
     <Box>

      {/* Total Value and Add Asset Button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h6" display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ bgcolor: '#3861FB', width: 30, height: 30 }}>
            <FaTh size={15} color="#FFFFFF" />
          </Avatar>
            Total Value
          </Typography>
          <Typography variant="h4" fontWeight="bold" marginY={1}>${totalPortfolioValue.toFixed(2)}</Typography>
          <Typography 
          variant="body1" fontWeight="600" display="flex" alignItems="center" 
          gap={0.25}  style={{ color: getTextColor(portfolioValueChange) }}>
            ${portfolioValueChange.toFixed(2)}<FaCaretUp size={14} />{portfolioPercentageChange.toFixed(2)}% ({timePeriod})
          </Typography>
        </Box>
        <Button variant="contained" sx={{ backgroundColor: '#3861FB', color: "#FFFFFF" }} startIcon={<FaPlus />} onClick={() => setShowAssetForm(true)}>
          Add Asset
        </Button>
      </Box>

      {/* Charts */}
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Performance
        </Typography>
        <Box display="flex">
          {["1h", "24h", "7d", "30d"].map((timeframe: string, index: number) => (
            <Button
            key={timeframe}
            onClick={() => setTimePeriod(timeframe)}
            sx={{
              backgroundColor: timePeriod === timeframe ? isDarkMode ? "#2196f3" : "#1976d2" : isDarkMode ? "#424242" : "#e0e0e0",
              color: timePeriod === timeframe ? "#fff" : isDarkMode ? "#ffffff" : "#000000",
              fontWeight: timePeriod === timeframe ? "bold" : "normal",
              textTransform: "none",
              borderRadius: 0,
              minWidth: 50,
              "&:hover": {
                backgroundColor: timePeriod === timeframe ? isDarkMode ? "#2196f3" : "#1976d2" : isDarkMode ? "#616161" : "#d6d6d6",
              },
              ...(index === 0 && { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }),
              ...(index === 3 && { borderTopRightRadius: 8, borderBottomRightRadius: 8 }),
            }}
          >
            {timeframe}
          </Button>
          ))}
        </Box>
      </Box>

      <Box 
        sx={{  
          borderRadius: 2,  
        }}
      >
        <PortfolioChart data={chartData} range={timePeriod} loading={graphLoading} />
      </Box>
    </Paper>

      {/* Assets Table */}
      <Typography 
        variant="h4" 
        fontWeight="bold"  
        display="flex" 
        alignItems="center" 
        gap={1}
        mt={4}
      >
        <FaBitcoin size={36} color='#3861FB' />
        Your Assets
      </Typography>
      <TableContainer component={Paper} sx={{ my: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Assets</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>value</TableCell>
              <TableCell>Investment</TableCell>
              <TableCell>Gain/Loss($)</TableCell>
              <TableCell>Performance(%)</TableCell>
              <TableCell>Allocation(%)</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((asset) => {

             const matchingAsset = cryptoAssets.find((crypto) => crypto.name === asset.name);
             
             const name = matchingAsset?.name;
             const logo = matchingAsset?.logoUrl;
             const symbol = matchingAsset?.symbol;
             const cryptoPrice = matchingAsset ? matchingAsset.currentPrice : '0';

             const cleanedCryptoPrice = cryptoPrice.replace(",", "");
             const value = parseFloat(cleanedCryptoPrice) * parseFloat(asset.amount);

             const investment = (parseFloat(asset.amount) * parseFloat(asset.buyPrice)) + parseFloat(asset.fee);

             const gainOrLoss = value - investment;

             const performance = (gainOrLoss/investment) * 100;

            const allocation = (value / totalPortfolioValue) * 100;

              return (
              <TableRow
                key={asset.id}
                sx={{ cursor: "pointer" }}
                onClick={() => handleRowClick({ ...asset, name, logo, symbol, value, investment, gainOrLoss, performance, allocation })}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <img
                      src={logo}
                      alt={name}
                      width={24}
                      height={24}
                      style={{ borderRadius: "50%" }}
                    />
                    {name}({symbol})
                  </Box>
                </TableCell>
                <TableCell>{asset.amount}</TableCell>
                <TableCell>
                  ${cryptoPrice}
                </TableCell>
                <TableCell>
                  ${value.toFixed(2)}
                </TableCell>
                <TableCell>
                  ${investment.toFixed(2)}
                </TableCell>
                <TableCell style={{ color: getTextColor(gainOrLoss) }}>${gainOrLoss.toFixed(2)}</TableCell>
                <TableCell style={{ color: getTextColor(performance) }}>{performance.toFixed(2)}%</TableCell>
                <TableCell>{allocation.toFixed(5)}%</TableCell>
                <TableCell>
                 <HiOutlineDotsHorizontal size={24} onClick={(event) => {
                    event.stopPropagation();
                    setSelectedAsset(asset);
                    setShowActionModal(true);
                 }} />
                </TableCell>
              </TableRow>
              )
            }
            )}
          </TableBody>
        </Table>
      </TableContainer>
     </Box>
   )}

   {/* Modal for Adding Asset */}
   <Modal
     open={showAssetForm}
     onClose={() => setShowAssetForm(false)}
     aria-labelledby="add-asset-modal"
     aria-describedby="modal-to-add-crypto-asset"
   >
     <Box
       sx={{
         position: "absolute",
         top: "50%",
         left: "50%",
         transform: "translate(-50%, -50%)",
         width: 400,
         padding: 3,
         bgcolor: isDarkMode ? "#121212" : "#fff",
         borderRadius: 2,
         boxShadow: 24,
         color: isDarkMode ? "#fff" : "#000",
       }}
     >
       {/* Header */}
       <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
         <Typography variant="h5" fontWeight="bold">Add New Asset</Typography>
         <RiCloseLine
           size={24}
           color={isDarkMode ? "white" : "black"}
           style={{ cursor: "pointer" }}
           onClick={() => setShowAssetForm(false)}
         />
       </Box>

       {/* Input Fields */}
       <Box sx={{ position: "relative" }}>
         <TextField
           label="Asset Name"
           fullWidth
           variant="outlined"
           margin="normal"
           value={coin}
           required
           onFocus={() => {
             setShowDropdown(true);
             setIsFocused(true);
           }}
           onBlur={handleBlur}
           onChange={(e) => setCoin(e.target.value)}
           autoComplete="off"
           InputProps={{
             sx: {
               bgcolor: isDarkMode ? "#1E1E1E" : "#fff",
               color: isDarkMode ? "#fff" : "#000",
             },
             endAdornment: (
               <InputAdornment position="end">
                 <IconButton
                   sx={{
                     transition: "transform 0.3s",
                     transform: isFocused ? "rotate(180deg)" : "rotate(0deg)",
                     color: isDarkMode ? "#fff" : "#000",
                   }}
                 >
                   <BsChevronDown size={18} />
                 </IconButton>
               </InputAdornment>
             ),
           }}
         />

         {/* Dropdown */}
         {showDropdown && (
           <animated.div
             style={{
               ...dropdownAnimation,
               position: "absolute",
               top: "100%",
               left: 0,
               width: "100%",
               zIndex: 1000,
             }}
             ref={dropdownRef}
           >
             <Paper
               sx={{
                 position: "absolute",
                 top: 0,
                 left: 0,
                 width: "100%",
                 maxHeight: 200,
                 overflowY: "auto",
                 backgroundColor: isDarkMode ? "#1E1E1E" : "#fff",
                 color: isDarkMode ? "#fff" : "#000",
                 boxShadow: isDarkMode
                ? "0px 4px 10px rgba(255,255,255,0.1)"
                : "0px 4px 10px rgba(0,0,0,0.1)",
                 borderRadius: "8px",
                 zIndex: 1000,
                 mt: 1,
               }}
             >
               {filteredAssets.length === 0 ? (
                 <ListItem>
                   <ListItemText primary="No Data" sx={{ color: isDarkMode ? "#fff" : "#000" }} />
                 </ListItem>
               ) : (
                 <List>
                   {filteredAssets.map((coin) => (
                     <ListItem
                       key={coin.name}
                       onMouseDown={() => handleSelectCoin(coin.name, coin.currentPrice)}
                       sx={{
                         "&:hover": {
                           backgroundColor: isDarkMode ? "#333" : "#f0f0f0",
                         },
                         cursor: "pointer",
                         padding: "8px 16px",
                         color: isDarkMode ? "#fff" : "#000",
                       }}
                     >
                       <ListItemText primary={`${coin.name} (${coin.symbol})`} />
                     </ListItem>
                   ))}
                 </List>
               )}
             </Paper>
           </animated.div>
         )}
       </Box>

       {/* Quantity & Price Inputs */}
       <Box display="flex"    justifyContent="space-between"    alignItems="center" gap={2}>
         <TextField
           label="Quantity"
           fullWidth
           variant="outlined"
           margin="normal"
           required
           value={quantity}
           onChange={(e) => {
             const value = e.target.value;
             if (/^\d*\.?\d*$/.test(value)) {
               setQuantity(value);
             }
           }}
           autoComplete="off"
           inputProps={{ inputMode: "decimal", pattern: "[0-9]*" }}
           sx={{
             bgcolor: isDarkMode ? "#1E1E1E" : "#fff",
             color: isDarkMode ? "#fff" : "#000",
           }}
         />
         <TextField
           label="Price Per Coin"
           fullWidth
           variant="outlined"
           margin="normal"
           required
           value={pricePerCoin}
           onChange={(e) => {
             const value = e.target.value;
             if (/^\d*\.?\d*$/.test(value)) {
               setPricePerCoin(value);
             }
           }}
           autoComplete="off"
           inputProps={{ inputMode: "decimal", pattern: "[0-9]*" }}
           sx={{
             bgcolor: isDarkMode ? "#1E1E1E" : "#fff",
             color: isDarkMode ? "#fff" : "#000",
           }}
           InputProps={{
             endAdornment: (
               <InputAdornment position="end">
                 <AiOutlineDollar size={20} color={isDarkMode ? "#fff" : "#000"} />
               </InputAdornment>
             ),
           }}
         />
       </Box>

       {/* Total Spent */}
       <TextField
         label="Total spent"
         fullWidth
         variant="outlined"
         margin="normal"
         value={totalSpent}
         autoComplete="off"
         inputProps={{ inputMode: "decimal", pattern: "[0-9]*" }}
         sx={{
           bgcolor: isDarkMode ? "#1E1E1E" : "#fff",
           color: isDarkMode ? "#fff" : "#000",
         }}
         InputProps={{
           endAdornment: (
             <InputAdornment position="end">
               <AiOutlineDollar size={20} color={isDarkMode ? "#fff" : "#000"} />
             </InputAdornment>
           ),
         }}
       />

       {/* Fees */}
       <TextField
         label="Fees"
         fullWidth
         variant="outlined"
         margin="normal"
         value={fees}
         onChange={(e) => {
           const value = e.target.value;
           if (/^\d*\.?\d*$/.test(value)) {
             setFees(value);
           }
         }}
         autoComplete="off"
         inputProps={{ inputMode: "decimal", pattern: "[0-9]*" }}
         sx={{
           bgcolor: isDarkMode ? "#1E1E1E" : "#fff",
           color: isDarkMode ? "#fff" : "#000",
         }}
         InputProps={{
           endAdornment: (
             <InputAdornment position="end">
               <AiOutlineDollar size={20} color={isDarkMode ? "#fff" : "#000"} />
             </InputAdornment>
           ),
         }}
       />

       {/* Notes */}
       <TextField
         label="Notes"
         fullWidth
         variant="outlined"
         margin="normal"
         value={notes}
         onChange={(e) => setNotes(e.target.value)}
         autoComplete="off"
         multiline
         rows={4}
         sx={{
           bgcolor: isDarkMode ? "#1E1E1E" : "#fff",
           color: isDarkMode ? "#fff" : "#000",
         }}
       />

       {/* Submit Button */}
       <Button
         variant="contained"
         sx={{
           mt: 2,
           width: "100%",
           bgcolor: isDarkMode ? "#1976d2" : "#1565c0",
           color: "#fff",
           "&:hover": {
             bgcolor: isDarkMode ? "#1565c0" : "#0d47a1",
           },
         }}
         disabled={!coin || !quantity || !pricePerCoin}
         onClick={handleSubmit}
       >
         Add Asset
       </Button>
     </Box>
   </Modal>

   {snackbar.open && (
      <CustomSnackbar message={snackbar.message} severity={snackbar.severity} setSnackbar={setSnackbar} />
   )}

   <AssetDetails 
      showAssetDetails={showAssetDetails}
      setShowAssetDetails={setShowAssetDetails}
      selectedAsset={selectedAsset}
   />

   <PortfolioAction 
      showActionModal={showActionModal}
      setShowActionModal={setShowActionModal}
      selectedAsset={selectedAsset}
      userId={token?.id}
      onLoadingChange={handleLoadingChange} 
      isDarkMode={isDarkMode} 
    />

   </div>
 );

}

export default Portfolio
