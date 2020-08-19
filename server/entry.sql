CREATE TABLE `entry` (
  `Word` varchar(255) NOT NULL,
  `Pronunciation` varchar(255) DEFAULT NULL,
  `Definition` longtext,
  `PartOfSpeech` varchar(255) NOT NULL,
  PRIMARY KEY (`Word`,`PartOfSpeech`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1