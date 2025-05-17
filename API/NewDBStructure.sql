CREATE DATABASE IF NOT EXISTS `u24856462_COS221PA5` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `u24856462_COS221PA5`;

-- --------------------------------------------------------

--
-- Table structure for table `BestProduct`
--

CREATE TABLE `BestProduct` (
                               `ProductID` int(11) NOT NULL,
                               `Name` varchar(255) DEFAULT NULL,
                               `Description` text DEFAULT NULL,
                               `BrandID` int(11) DEFAULT NULL,
                               `CategoryID` int(11) DEFAULT NULL,
                               `BestPrice` decimal(10,2) DEFAULT NULL,
                               `DiscountPercent` decimal(5,2) DEFAULT NULL,
                               `RegularPrice` decimal(10,2) DEFAULT NULL,
                               `ReviewCount` int(11) DEFAULT NULL,
                               `ReviewAverage` decimal(3,2) DEFAULT NULL,
                               `BestCompany` varchar(100) DEFAULT NULL,
                               `OnlineAvailability` tinyint(1) DEFAULT NULL,
                               `AddToCartURL` varchar(255) DEFAULT NULL,
                               `ThumbnailImage` varchar(255) DEFAULT NULL,
                               `CarouselImages` text DEFAULT NULL,
                               `LastUpdated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
-- --------------------------------------------------------

--
-- Table structure for table `Bitify`
--

CREATE TABLE `Bitify` (
  `ProductID` int(11) NOT NULL,
  `RegularPrice` decimal(10,2) DEFAULT NULL,
  `DiscountedPrice` decimal(10,2) DEFAULT NULL,
  `AddToCartURL` varchar(255) DEFAULT NULL,
  `OnlineAvailability` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `Brand`
--

CREATE TABLE `Brand` (
  `BrandID` int(11) NOT NULL,
  `BrandName` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `ByteCrate`
--

CREATE TABLE `ByteCrate` (
  `ProductID` int(11) NOT NULL,
  `RegularPrice` decimal(10,2) DEFAULT NULL,
  `DiscountedPrice` decimal(10,2) DEFAULT NULL,
  `AddToCartURL` varchar(255) DEFAULT NULL,
  `OnlineAvailability` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `ByteMart`
--

CREATE TABLE `ByteMart` (
  `ProductID` int(11) NOT NULL,
  `RegularPrice` decimal(10,2) DEFAULT NULL,
  `DiscountedPrice` decimal(10,2) DEFAULT NULL,
  `AddToCartURL` varchar(255) DEFAULT NULL,
  `OnlineAvailability` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `Category`
--

CREATE TABLE `Category` (
  `CategoryID` int(11) NOT NULL,
  `CategoryName` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ChipCart`
--

CREATE TABLE `ChipCart` (
  `ProductID` int(11) NOT NULL,
  `RegularPrice` decimal(10,2) DEFAULT NULL,
  `DiscountedPrice` decimal(10,2) DEFAULT NULL,
  `AddToCartURL` varchar(255) DEFAULT NULL,
  `OnlineAvailability` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `Company`
--

CREATE TABLE `Company` (
  `CompanyID` int(11) NOT NULL,
  `Name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `CoreBay`
--

CREATE TABLE `CoreBay` (
  `ProductID` int(11) NOT NULL,
  `RegularPrice` decimal(10,2) DEFAULT NULL,
  `DiscountedPrice` decimal(10,2) DEFAULT NULL,
  `AddToCartURL` varchar(255) DEFAULT NULL,
  `OnlineAvailability` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `FuseBasket`
--

CREATE TABLE `FuseBasket` (
  `ProductID` int(11) NOT NULL,
  `RegularPrice` decimal(10,2) DEFAULT NULL,
  `DiscountedPrice` decimal(10,2) DEFAULT NULL,
  `AddToCartURL` varchar(255) DEFAULT NULL,
  `OnlineAvailability` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `Nexonic`
--

CREATE TABLE `Nexonic` (
  `ProductID` int(11) NOT NULL,
  `RegularPrice` decimal(10,2) DEFAULT NULL,
  `DiscountedPrice` decimal(10,2) DEFAULT NULL,
  `AddToCartURL` varchar(255) DEFAULT NULL,
  `OnlineAvailability` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `Review`
--

CREATE TABLE `Review` (
  `ReviewID` int(11) NOT NULL,
  `ProductID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `ReviewTitle` varchar(255) DEFAULT NULL,
  `ReviewDescription` text DEFAULT NULL,
  `ReviewRating` tinyint(4) NOT NULL CHECK (`ReviewRating` between 1 and 5),
  `Timestamp` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `TechNova`
--

CREATE TABLE `TechNova` (
  `ProductID` int(11) NOT NULL,
  `RegularPrice` decimal(10,2) DEFAULT NULL,
  `DiscountedPrice` decimal(10,2) DEFAULT NULL,
  `AddToCartURL` varchar(255) DEFAULT NULL,
  `OnlineAvailability` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `UserID` int(11) NOT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `Username` varchar(50) DEFAULT NULL,
  `Salt` varchar(64) DEFAULT NULL,
  `PasswordHash` char(128) DEFAULT NULL,
  `APIKey` varchar(64) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `VoltEdge`
--

CREATE TABLE `VoltEdge` (
  `ProductID` int(11) NOT NULL,
  `RegularPrice` decimal(10,2) DEFAULT NULL,
  `DiscountedPrice` decimal(10,2) DEFAULT NULL,
  `AddToCartURL` varchar(255) DEFAULT NULL,
  `OnlineAvailability` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `ZapNest`
--

CREATE TABLE `ZapNest` (
  `ProductID` int(11) NOT NULL,
  `RegularPrice` decimal(10,2) DEFAULT NULL,
  `DiscountedPrice` decimal(10,2) DEFAULT NULL,
  `AddToCartURL` varchar(255) DEFAULT NULL,
  `OnlineAvailability` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for table `BestProduct`
--
ALTER TABLE `BestProduct`
  ADD PRIMARY KEY (`ProductID`),
  ADD KEY `fk_BP1` (`BrandID`),
  ADD KEY `fk_BP2` (`CategoryID`);

--
-- Indexes for table `Bitify`
--
ALTER TABLE `Bitify`
  ADD PRIMARY KEY (`ProductID`);

--
-- Indexes for table `Brand`
--
ALTER TABLE `Brand`
  ADD PRIMARY KEY (`BrandID`),
  ADD UNIQUE KEY `BrandName` (`BrandName`);

--
-- Indexes for table `ByteCrate`
--
ALTER TABLE `ByteCrate`
  ADD PRIMARY KEY (`ProductID`);

--
-- Indexes for table `ByteMart`
--
ALTER TABLE `ByteMart`
  ADD PRIMARY KEY (`ProductID`);

--
-- Indexes for table `Category`
--
ALTER TABLE `Category`
  ADD PRIMARY KEY (`CategoryID`),
  ADD UNIQUE KEY `CategoryName` (`CategoryName`);

--
-- Indexes for table `ChipCart`
--
ALTER TABLE `ChipCart`
  ADD PRIMARY KEY (`ProductID`);

--
-- Indexes for table `Company`
--
ALTER TABLE `Company`
  ADD PRIMARY KEY (`CompanyID`),
  ADD UNIQUE KEY `Name` (`Name`);

--
-- Indexes for table `CoreBay`
--
ALTER TABLE `CoreBay`
  ADD PRIMARY KEY (`ProductID`);

--
-- Indexes for table `FuseBasket`
--
ALTER TABLE `FuseBasket`
  ADD PRIMARY KEY (`ProductID`);

--
-- Indexes for table `Nexonic`
--
ALTER TABLE `Nexonic`
  ADD PRIMARY KEY (`ProductID`);

--
-- Indexes for table `Review`
--
ALTER TABLE `Review`
  ADD PRIMARY KEY (`ReviewID`),
  ADD KEY `fk_Review1` (`ProductID`),
  ADD KEY `fk_Review2` (`UserID`);

--
-- Indexes for table `TechNova`
--
ALTER TABLE `TechNova`
  ADD PRIMARY KEY (`ProductID`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`UserID`),
  ADD UNIQUE KEY `Email` (`Email`),
  ADD UNIQUE KEY `Username` (`Username`),
  ADD UNIQUE KEY `PasswordHash` (`PasswordHash`),
  ADD UNIQUE KEY `APIKey` (`APIKey`);

--
-- Indexes for table `VoltEdge`
--
ALTER TABLE `VoltEdge`
  ADD PRIMARY KEY (`ProductID`);

--
-- Indexes for table `ZapNest`
--
ALTER TABLE `ZapNest`
  ADD PRIMARY KEY (`ProductID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `BestProduct`
--
ALTER TABLE `BestProduct`
  MODIFY `ProductID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=691;

--
-- AUTO_INCREMENT for table `Brand`
--
ALTER TABLE `Brand`
  MODIFY `BrandID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=122;

--
-- AUTO_INCREMENT for table `Category`
--
ALTER TABLE `Category`
  MODIFY `CategoryID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=191;

--
-- AUTO_INCREMENT for table `Company`
--
ALTER TABLE `Company`
  MODIFY `CompanyID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `Review`
--
ALTER TABLE `Review`
  MODIFY `ReviewID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `UserID` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `BestProduct`
--
ALTER TABLE `BestProduct`
  ADD CONSTRAINT `fk_BP1` FOREIGN KEY (`BrandID`) REFERENCES `Brand` (`BrandID`),
  ADD CONSTRAINT `fk_BP2` FOREIGN KEY (`CategoryID`) REFERENCES `Category` (`CategoryID`);

--
-- Constraints for table `Bitify`
--
ALTER TABLE `Bitify`
  ADD CONSTRAINT `fk_Bitify` FOREIGN KEY (`ProductID`) REFERENCES `BestProduct` (`ProductID`);

--
-- Constraints for table `ByteCrate`
--
ALTER TABLE `ByteCrate`
  ADD CONSTRAINT `fk_ByteCrate` FOREIGN KEY (`ProductID`) REFERENCES `BestProduct` (`ProductID`);

--
-- Constraints for table `ByteMart`
--
ALTER TABLE `ByteMart`
  ADD CONSTRAINT `fk_ByteMart` FOREIGN KEY (`ProductID`) REFERENCES `BestProduct` (`ProductID`);

--
-- Constraints for table `ChipCart`
--
ALTER TABLE `ChipCart`
  ADD CONSTRAINT `fk_ChipCart` FOREIGN KEY (`ProductID`) REFERENCES `BestProduct` (`ProductID`);

--
-- Constraints for table `CoreBay`
--
ALTER TABLE `CoreBay`
  ADD CONSTRAINT `fk_CoreBay` FOREIGN KEY (`ProductID`) REFERENCES `BestProduct` (`ProductID`);

--
-- Constraints for table `FuseBasket`
--
ALTER TABLE `FuseBasket`
  ADD CONSTRAINT `fk_FuseBasket` FOREIGN KEY (`ProductID`) REFERENCES `BestProduct` (`ProductID`);

--
-- Constraints for table `Nexonic`
--
ALTER TABLE `Nexonic`
  ADD CONSTRAINT `fk_Nexonic` FOREIGN KEY (`ProductID`) REFERENCES `BestProduct` (`ProductID`);

--
-- Constraints for table `Review`
--
ALTER TABLE `Review`
  ADD CONSTRAINT `fk_Review1` FOREIGN KEY (`ProductID`) REFERENCES `BestProduct` (`ProductID`),
  ADD CONSTRAINT `fk_Review2` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`);

--
-- Constraints for table `TechNova`
--
ALTER TABLE `TechNova`
  ADD CONSTRAINT `fk_TechNova` FOREIGN KEY (`ProductID`) REFERENCES `BestProduct` (`ProductID`);

--
-- Constraints for table `VoltEdge`
--
ALTER TABLE `VoltEdge`
  ADD CONSTRAINT `fk_VoltEdge` FOREIGN KEY (`ProductID`) REFERENCES `BestProduct` (`ProductID`);

--
-- Constraints for table `ZapNest`
--
ALTER TABLE `ZapNest`
  ADD CONSTRAINT `fk_ZapNest` FOREIGN KEY (`ProductID`) REFERENCES `BestProduct` (`ProductID`);