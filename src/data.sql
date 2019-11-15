-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le :  ven. 15 nov. 2019 à 15:02
-- Version du serveur :  5.7.26
-- Version de PHP :  7.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `project_api`
--

-- --------------------------------------------------------

--
-- Structure de la table `faculties`
--

DROP TABLE IF EXISTS `faculties`;
CREATE TABLE IF NOT EXISTS `faculties` (
  `idfaculties` int(11) NOT NULL,
  `name` varchar(70) NOT NULL,
  `nb_student` smallint(5) NOT NULL,
  `diploma` varchar(80) NOT NULL,
  `nb_years` smallint(6) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `idschools` int(11) NOT NULL,
  PRIMARY KEY (`idfaculties`),
  KEY `idschools` (`idschools`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `intervenants`
--

DROP TABLE IF EXISTS `intervenants`;
CREATE TABLE IF NOT EXISTS `intervenants` (
  `idusers` int(11) NOT NULL,
  `idinter` int(11) NOT NULL,
  `firstname` varchar(70) NOT NULL,
  `lastname` varchar(70) NOT NULL,
  `email` varchar(150) NOT NULL,
  `Sexe` enum('Femme','Homme','Non-binaire') NOT NULL,
  `type` enum('Formateur') NOT NULL,
  `password` varchar(70) DEFAULT NULL,
  `date_naissance` date NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`idusers`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `intervenir`
--

DROP TABLE IF EXISTS `intervenir`;
CREATE TABLE IF NOT EXISTS `intervenir` (
  `idfaculties` int(11) NOT NULL,
  `idusers` int(11) NOT NULL,
  PRIMARY KEY (`idfaculties`,`idusers`),
  KEY `idusers` (`idusers`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `schools`
--

DROP TABLE IF EXISTS `schools`;
CREATE TABLE IF NOT EXISTS `schools` (
  `idschools` int(11) NOT NULL,
  `name` varchar(70) NOT NULL,
  `street` varchar(120) NOT NULL,
  `zip` smallint(6) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `faculty` varchar(70) NOT NULL,
  `city` varchar(70) DEFAULT NULL,
  PRIMARY KEY (`idschools`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `studients`
--

DROP TABLE IF EXISTS `studients`;
CREATE TABLE IF NOT EXISTS `studients` (
  `idusers` int(11) NOT NULL,
  `idstudents` int(11) NOT NULL,
  `firstname` varchar(70) NOT NULL,
  `lastname` varchar(70) NOT NULL,
  `email` varchar(150) NOT NULL,
  `Sexe` enum('Femme','Homme','Non-binaire') NOT NULL,
  `type` enum('Etudiant') NOT NULL,
  `password` varchar(70) DEFAULT NULL,
  `date_naissance` date NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `idfaculties` int(5) NOT NULL,
  PRIMARY KEY (`idusers`),
  KEY `idfaculties` (`idfaculties`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `idusers` int(11) NOT NULL,
  `firstname` varchar(70) NOT NULL,
  `lastname` varchar(70) NOT NULL,
  `email` varchar(150) NOT NULL,
  `Sexe` enum('Femme','Homme','Non-binaire') NOT NULL,
  `type` enum('Etudiant','Formateur') NOT NULL,
  `password` varchar(70) DEFAULT NULL,
  `date_naissance` date NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`idusers`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
