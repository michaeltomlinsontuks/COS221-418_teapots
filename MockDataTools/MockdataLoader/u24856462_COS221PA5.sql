-- phpMyAdmin SQL Dump
-- version 5.0.4deb2~bpo10+1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 12, 2025 at 05:07 PM
-- Server version: 10.3.39-MariaDB-0+deb10u2
-- PHP Version: 7.3.31-1~deb10u7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u24856462_COS221PA5`
--

-- --------------------------------------------------------

--
-- Table structure for table `Brand`
--

CREATE TABLE `Brand` (
                         `BrandID` int(11) NOT NULL,
                         `BrandName` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Category`
--

CREATE TABLE `Category` (
                            `CategoryID` int(11) NOT NULL,
                            `CategoryName` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `FinalProduct`
--

CREATE TABLE `FinalProduct` (
                                `ProductID` int(11) NOT NULL,
                                `ReviewCount` int(11) DEFAULT NULL,
                                `ReviewAverage` decimal(3,2) DEFAULT NULL,
                                `BestCompany` varchar(100) DEFAULT NULL,
                                `BestPrice` decimal(10,2) DEFAULT NULL,
                                `DiscountPercent` decimal(5,2) DEFAULT NULL,
                                `RegularPrice` decimal(10,2) DEFAULT NULL,
                                `AddToCartURL` varchar(255) DEFAULT NULL,
                                `OnlineAvailability` tinyint(1) DEFAULT NULL,
                                `LastUpdated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Product`
--

CREATE TABLE `Product` (
                           `ProductID` int(11) NOT NULL,
                           `Name` varchar(255) DEFAULT NULL,
                           `ReviewCount` int(11) DEFAULT NULL,
                           `ReviewAverage` decimal(3,2) DEFAULT NULL,
                           `Description` text DEFAULT NULL,
                           `BrandName` varchar(100) DEFAULT NULL,
                           `CategoryName` varchar(100) DEFAULT NULL,
                           `ThumbnailImage` varchar(255) DEFAULT NULL,
                           `CarouselImages` text DEFAULT NULL,
                           `Type` varchar(20) DEFAULT NULL,
                           `AddToCartURL` varchar(255) DEFAULT NULL,
                           `SalePrice` decimal(10,2) DEFAULT NULL,
                           `OnlineAvailability` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

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
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
                         `UserID` int(11) NOT NULL,
                         `Username` varchar(50) NOT NULL,
                         `PasswordHash` varchar(255) NOT NULL,
                         `Salt` varchar(64) NOT NULL,
                         `APIKey` varchar(64) DEFAULT NULL,
                         `CreatedAt` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Brand`
--
ALTER TABLE `Brand`
    ADD PRIMARY KEY (`BrandID`),
  ADD UNIQUE KEY `BrandName` (`BrandName`);

--
-- Indexes for table `Category`
--
ALTER TABLE `Category`
    ADD PRIMARY KEY (`CategoryID`),
  ADD UNIQUE KEY `CategoryName` (`CategoryName`);

--
-- Indexes for table `FinalProduct`
--
ALTER TABLE `FinalProduct`
    ADD PRIMARY KEY (`ProductID`);

--
-- Indexes for table `Product`
--
ALTER TABLE `Product`
    ADD PRIMARY KEY (`ProductID`);

--
-- Indexes for table `Review`
--
ALTER TABLE `Review`
    ADD PRIMARY KEY (`ReviewID`),
  ADD KEY `ProductID` (`ProductID`),
  ADD KEY `UserID` (`UserID`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
    ADD PRIMARY KEY (`UserID`),
  ADD UNIQUE KEY `Username` (`Username`),
  ADD UNIQUE KEY `APIKey` (`APIKey`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Brand`
--
ALTER TABLE `Brand`
    MODIFY `BrandID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Category`
--
ALTER TABLE `Category`
    MODIFY `CategoryID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Product`
--
ALTER TABLE `Product`
    MODIFY `ProductID` int(11) NOT NULL AUTO_INCREMENT;

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
-- Constraints for table `FinalProduct`
--
ALTER TABLE `FinalProduct`
    ADD CONSTRAINT `FinalProduct_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `Product` (`ProductID`);

--
-- Constraints for table `Review`
--
ALTER TABLE `Review`
    ADD CONSTRAINT `Review_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `Product` (`ProductID`),
  ADD CONSTRAINT `Review_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
