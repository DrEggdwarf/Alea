/**
 * Chess Opening Book Utility
 *
 * Identifies chess openings from a sequence of SAN moves.
 * Covers ~80 of the most common openings with French descriptions and tips.
 *
 * @module openings
 */

/**
 * @typedef {Object} OpeningResult
 * @property {string}      name        - Opening name (e.g. "Sicilian Defense")
 * @property {string|null} variation   - Specific variation name, or null for the root opening
 * @property {string}      eco         - ECO code (e.g. "B90")
 * @property {string}      description - 1-2 sentence French description of the idea
 * @property {string}      tips        - 1 sentence French tip on what to watch for
 */

const OPENING_BOOK = [

  // ─────────────────────────────────────────────────────────────────────────────
  // OPEN GAMES — 1.e4 e5
  // ─────────────────────────────────────────────────────────────────────────────

  // Italian Game / Giuoco Piano
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d4", "exd4", "cxd4", "Bb4+"],
    name: "Italian Game",
    variation: "Giuoco Piano — Centre Attack",
    eco: "C54",
    description: "Les Blancs sacrifient un pion pour ouvrir le centre et activer rapidement toutes leurs pièces.",
    tips: "Surveiller la case f7, cible classique des attaques italiennes.",
  },
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d4"],
    name: "Italian Game",
    variation: "Giuoco Piano — Centre Attack",
    eco: "C54",
    description: "Les Blancs construisent un centre puissant avec c3-d4 tout en gardant le fou actif sur c4.",
    tips: "Les Noirs doivent réagir au centre immédiatement, sinon les Blancs obtiennent un avantage d'espace décisif.",
  },
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4"],
    name: "Italian Game",
    variation: "Evans Gambit",
    eco: "C51",
    description: "Les Blancs sacrifient le pion b4 pour obtenir un développement rapide et un centre puissant.",
    tips: "Accepter le gambit expose les Noirs à une attaque rapide ; le refus avec Bb6 est une option solide.",
  },
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "O-O", "Nf6"],
    name: "Italian Game",
    variation: "Giuoco Piano",
    eco: "C53",
    description: "Position symétrique classique du Giuoco Piano où les deux camps développent harmonieusement leurs pièces.",
    tips: "Le plan typique des Blancs est c3 puis d4 ; les Noirs visent à contester le centre avec d5.",
  },
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6"],
    name: "Italian Game",
    variation: "Two Knights Defense",
    eco: "C55",
    description: "Les Noirs cherchent un contre-jeu actif plutôt qu'une défense passive.",
    tips: "Attention à Ng5 des Blancs qui attaque f7 ; d5 est la réponse la plus combative des Noirs.",
  },
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"],
    name: "Italian Game",
    variation: null,
    eco: "C50",
    description: "L'une des plus anciennes ouvertures : les Blancs visent le contrôle du centre et le roque rapide.",
    tips: "Priorité au développement et au roque avant de lancer des attaques.",
  },

  // Ruy Lopez
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6", "O-O", "Nxe4", "d4", "Nd6", "Bxc6", "dxc6", "dxe5"],
    name: "Ruy Lopez",
    variation: "Berlin Defense — Endgame",
    eco: "C67",
    description: "La finale de Berlin, popularisée par Kramnik contre Kasparov : solidité absolue en échange d'une structure queenside acceptée.",
    tips: "Les Noirs ont deux fous et une structure queenside active ; ne pas sous-estimer leur endgame.",
  },
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6"],
    name: "Ruy Lopez",
    variation: "Berlin Defense",
    eco: "C65",
    description: "Défense solide et ultra-théorique, favorite des joueurs qui recherchent la solidité.",
    tips: "Éviter l'échange Bxc6 trop tôt ; les Noirs visent un jeu d'endgame stable.",
  },
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7", "Re1", "b5", "Bb3", "O-O", "c3", "d5"],
    name: "Ruy Lopez",
    variation: "Marshall Attack",
    eco: "C89",
    description: "Les Noirs sacrifient un pion sur e5 pour obtenir une initiative d'attaque dévastatrice.",
    tips: "Les Blancs doivent connaître la théorie de l'anti-Marshall ou accepter une défense difficile.",
  },
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7", "Re1", "b5", "Bb3", "d6", "c3", "O-O"],
    name: "Ruy Lopez",
    variation: "Morphy Defense — Closed",
    eco: "C84",
    description: "Les Noirs se développent solidement avant de chercher le contre-jeu.",
    tips: "La pression des Blancs sur e5 est un thème permanent ; les Noirs doivent contrebalancer avec c5 ou d5.",
  },
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O"],
    name: "Ruy Lopez",
    variation: "Morphy Defense",
    eco: "C78",
    description: "Le roque immédiat des Blancs : début de la variante principale de la Partie Espagnole.",
    tips: "Les Noirs ont plusieurs continuations solides : Be7, Bc5, b5 ; chacune mène à un jeu différent.",
  },
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4"],
    name: "Ruy Lopez",
    variation: "Morphy Defense",
    eco: "C70",
    description: "Retraite classique du fou : les Blancs maintiennent la pression indirecte sur le cavalier de c6.",
    tips: "b5 est la réponse principale, menaçant de prendre le fou ; les Blancs doivent rester vigilants.",
  },
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"],
    name: "Ruy Lopez",
    variation: null,
    eco: "C60",
    description: "La Partie Espagnole est l'une des ouvertures les plus riches et étudiées des échecs, vieille de 500 ans.",
    tips: "Les Blancs visent une pression à long terme sur le centre ; les Noirs doivent trouver un contre-jeu actif.",
  },

  // Scotch Game
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4", "Nf6", "Nxc6", "bxc6", "e5"],
    name: "Scotch Game",
    variation: "Mieses Variation",
    eco: "C45",
    description: "Les Blancs gagnent de l'espace mais permettent aux Noirs d'obtenir deux fous.",
    tips: "Les Noirs avec Qe7 contre-attaquent immédiatement le pion e5 ; jeu dynamique et asymétrique.",
  },
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4", "Bc5"],
    name: "Scotch Game",
    variation: "Classical Variation",
    eco: "C45",
    description: "Les Noirs visent la case d4 avec leur fou pour limiter les options blanches.",
    tips: "Nxc6 ou Be3 sont les principales réponses des Blancs, menant à des positions complexes.",
  },
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4"],
    name: "Scotch Game",
    variation: null,
    eco: "C44",
    description: "Ouverture directe favori de Kasparov dans les années 1990 : d4 ouvre le jeu tôt.",
    tips: "Les échanges au centre mènent à un jeu ouvert où le développement et l'activité des pièces sont primordiaux.",
  },

  // King's Gambit
  {
    moves: ["e4", "e5", "f4", "exf4", "Nf3", "g5", "Bc4"],
    name: "King's Gambit",
    variation: "Bishop's Gambit",
    eco: "C33",
    description: "Les Blancs offrent le fou pour récupérer le pion f4 et maintenir l'initiative.",
    tips: "Les Noirs doivent défendre g5 soigneusement ; h6 est souvent nécessaire pour stabiliser.",
  },
  {
    moves: ["e4", "e5", "f4", "exf4", "Nf3"],
    name: "King's Gambit",
    variation: "King's Knight Gambit",
    eco: "C37",
    description: "Les Blancs développent leur cavalier tout en maintenant la pression sur le pion f4.",
    tips: "Les Noirs peuvent contester avec g5 ou d6 ; le jeu est vif et exige une préparation des deux côtés.",
  },
  {
    moves: ["e4", "e5", "f4", "exf4"],
    name: "King's Gambit",
    variation: "King's Gambit Accepted",
    eco: "C33",
    description: "Les Noirs prennent le pion offert et entrent dans une lutte pour le maintenir.",
    tips: "Les Blancs obtiennent un centre puissant et un développement rapide en compensation du pion sacrifié.",
  },
  {
    moves: ["e4", "e5", "f4", "d5"],
    name: "King's Gambit",
    variation: "Falkbeer Countergambit",
    eco: "C31",
    description: "Les Noirs refusent le gambit et attaquent immédiatement le centre blanc.",
    tips: "Jeu complexe et dynamique ; les Noirs cherchent l'initiative plutôt que la conservation du pion.",
  },
  {
    moves: ["e4", "e5", "f4"],
    name: "King's Gambit",
    variation: null,
    eco: "C30",
    description: "L'une des plus anciennes ouvertures romantiques : les Blancs sacrifient un pion pour une attaque rapide.",
    tips: "Ouverture à double tranchant ; nécessite une connaissance de la théorie des deux côtés.",
  },

  // Petrov Defense
  {
    moves: ["e4", "e5", "Nf3", "Nf6", "Nxe5", "d6", "Nf3", "Nxe4", "d4"],
    name: "Petrov Defense",
    variation: "Classical Variation",
    eco: "C42",
    description: "Position symétrique et solide, favorite des joueurs qui cherchent la nullité.",
    tips: "Les Blancs doivent viser une légère initiative ; les Noirs peuvent tenir facilement avec un jeu précis.",
  },
  {
    moves: ["e4", "e5", "Nf3", "Nf6"],
    name: "Petrov Defense",
    variation: null,
    eco: "C42",
    description: "La Défense Russe est une réponse symétrique ultra-solide souvent utilisée pour neutraliser l'avantage blanc.",
    tips: "Éviter de tomber dans des variations perdantes après Nxe5 ; la précision est essentielle.",
  },

  // Four Knights
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "Nc3", "Nf6", "Bb5"],
    name: "Four Knights Game",
    variation: "Spanish Variation",
    eco: "C48",
    description: "Les Blancs épinglent le cavalier noir avec Bb5 dans le Jeu des Quatre Cavaliers.",
    tips: "Le Contre-Gambit Rubinstein avec Nd4 donne aux Noirs un contre-jeu actif et complexe.",
  },
  {
    moves: ["e4", "e5", "Nf3", "Nc6", "Nc3", "Nf6"],
    name: "Four Knights Game",
    variation: null,
    eco: "C47",
    description: "Développement harmonieux des deux côtés menant à une position équilibrée.",
    tips: "Les Blancs peuvent viser le Jeu Écossais des Quatre Cavaliers avec d4.",
  },

  // Vienna Game
  {
    moves: ["e4", "e5", "Nc3", "Nf6", "f4"],
    name: "Vienna Game",
    variation: "Vienna Gambit",
    eco: "C28",
    description: "Combine les idées du Gambit du Roi avec un développement du cavalier plus solide.",
    tips: "Les Noirs peuvent accepter le gambit ou jouer d5 pour un contre-jeu immédiat.",
  },
  {
    moves: ["e4", "e5", "Nc3", "Nc6", "Bc4"],
    name: "Vienna Game",
    variation: "Vienna System",
    eco: "C26",
    description: "Le Système de Vienne avec Bc4 mène souvent à des structures italiennes avec un cavalier en c3.",
    tips: "f4 est souvent joué par les Blancs pour soutenir le centre et préparer une attaque sur le roi.",
  },
  {
    moves: ["e4", "e5", "Nc3"],
    name: "Vienna Game",
    variation: null,
    eco: "C25",
    description: "Les Blancs développent leur cavalier avant de décider du plan, gardant des options flexibles.",
    tips: "Moins contraignant que 2.Nf3 ; permet aux Blancs de choisir entre un jeu de gambit ou positionnel.",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SEMI-OPEN GAMES — 1.e4 ...
  // ─────────────────────────────────────────────────────────────────────────────

  // Sicilian Defense — Najdorf
  {
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Bg5"],
    name: "Sicilian Defense",
    variation: "Najdorf — 6.Bg5",
    eco: "B96",
    description: "L'une des attaques les plus agressives contre la Najdorf, cherchant des complications tactiques immédiates.",
    tips: "e6 ou h6 sont les réponses principales ; h6 mène à la variante du Pion Empoisonné avec Qb6.",
  },
  {
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Be3"],
    name: "Sicilian Defense",
    variation: "Najdorf — English Attack",
    eco: "B90",
    description: "L'Attaque Anglaise contre la Najdorf : les Blancs préparent f3 et g4 pour une attaque sur l'aile roi.",
    tips: "Les Noirs doivent réagir rapidement sur le queenside avec b5 avant que l'attaque blanche ne démarre.",
  },
  {
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"],
    name: "Sicilian Defense",
    variation: "Najdorf Variation",
    eco: "B90",
    description: "L'arme préférée de Fischer et Kasparov : a6 prépare b5 et empêche Nb5 des Blancs.",
    tips: "L'une des défenses les plus étudiées des échecs ; les deux camps ont de nombreuses lignes théoriques.",
  },

  // Sicilian — Dragon
  {
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "g6", "Be3", "Bg7", "f3", "O-O", "Qd2", "Nc6", "O-O-O"],
    name: "Sicilian Defense",
    variation: "Dragon — Yugoslav Attack",
    eco: "B76",
    description: "Les deux rois roquent du côté opposé et lancent des attaques mutuelles dans l'une des batailles les plus tranchantes.",
    tips: "La course aux attaques est vitale ; chaque tempo compte, les deux joueurs doivent attaquer sans hésiter.",
  },
  {
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "g6"],
    name: "Sicilian Defense",
    variation: "Dragon Variation",
    eco: "B70",
    description: "Les Noirs fianchettent leur fou roi pour une pression diagonale longue durée sur le centre.",
    tips: "Le fou dragon sur g7 est une pièce-clé ; ne jamais l'échanger sans compensation suffisante.",
  },

  // Sicilian — Scheveningen
  {
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "e6"],
    name: "Sicilian Defense",
    variation: "Scheveningen Variation",
    eco: "B80",
    description: "Structure solide et flexible : les Noirs forment un centre avec d6-e6 et conservent de nombreuses options.",
    tips: "Les Blancs ont plusieurs attaques (Keres, English) ; les Noirs doivent rester attentifs aux sacrifices sur e6.",
  },

  // Sicilian — Sveshnikov
  {
    moves: ["e4", "c5", "Nf3", "Nc6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "e5", "Nb5", "d6"],
    name: "Sicilian Defense",
    variation: "Sveshnikov Variation",
    eco: "B33",
    description: "Les Noirs acceptent une faiblesse sur d5 en échange d'un jeu actif et d'un centre dynamique.",
    tips: "La case d5 est une cible permanente pour les Blancs ; les Noirs compensent par une activité sur l'aile roi.",
  },

  // Sicilian — Alapin
  {
    moves: ["e4", "c5", "c3", "Nf6", "e5", "Nd5", "d4", "cxd4", "Nf3"],
    name: "Sicilian Defense",
    variation: "Alapin — ...Nf6 Line",
    eco: "B22",
    description: "Les Noirs répondent avec Nf6 pour attaquer immédiatement le pion e5 que les Blancs vont pousser.",
    tips: "Les Noirs obtiennent un bon contre-jeu ; la structure de pions après les échanges est légèrement favorable aux Noirs.",
  },
  {
    moves: ["e4", "c5", "c3"],
    name: "Sicilian Defense",
    variation: "Alapin Variation",
    eco: "B22",
    description: "La Variante Alapin prépare d4 pour établir un centre solide sans entrer dans la théorie principale.",
    tips: "Les Noirs peuvent répondre avec d5 ou Nf6 pour contester le centre ; moins de théorie que la Sicilienne ouverte.",
  },

  // Sicilian — Grand Prix Attack
  {
    moves: ["e4", "c5", "Nc3", "Nc6", "f4"],
    name: "Sicilian Defense",
    variation: "Grand Prix Attack",
    eco: "B23",
    description: "L'Attaque Grand Prix évite la théorie principale et lance directement une attaque sur l'aile roi avec f4-f5.",
    tips: "Les Noirs doivent répondre avec g6 et Bg7 ou e6 pour contrer l'attaque ; ne pas jouer passivement.",
  },

  // Sicilian — Open
  {
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3"],
    name: "Sicilian Defense",
    variation: "Open Sicilian",
    eco: "B40",
    description: "La ligne principale : les Blancs acceptent le déséquilibre et visent une attaque énergique.",
    tips: "C'est l'ouverture la plus jouée en tournoi ; les deux camps doivent connaître la théorie approfondie.",
  },
  {
    moves: ["e4", "c5"],
    name: "Sicilian Defense",
    variation: null,
    eco: "B20",
    description: "La Défense Sicilienne crée un déséquilibre immédiat : les Noirs refusent la symétrie et luttent différemment pour le centre.",
    tips: "Les Noirs visent un contre-jeu sur le queenside pendant que les Blancs attaquent sur le kingside.",
  },

  // French Defense
  {
    moves: ["e4", "e6", "d4", "d5", "Nc3", "Bb4"],
    name: "French Defense",
    variation: "Winawer Variation",
    eco: "C15",
    description: "Variante combative : les Noirs épinglent le cavalier blanc et créent des complications immédiates.",
    tips: "Les Blancs jouent souvent a3 pour forcer l'échange des fous, menant à une structure asymétrique.",
  },
  {
    moves: ["e4", "e6", "d4", "d5", "Nc3", "Nf6", "Bg5"],
    name: "French Defense",
    variation: "Classical Variation",
    eco: "C11",
    description: "Les Blancs épinglent le cavalier noir pour exercer une pression sur d5.",
    tips: "La pointe e5 ou exd5 sont les réponses typiques des Blancs ; chaque choix mène à un plan différent.",
  },
  {
    moves: ["e4", "e6", "d4", "d5", "e5"],
    name: "French Defense",
    variation: "Advance Variation",
    eco: "C02",
    description: "Les Blancs poussent e5 pour gagner de l'espace et empêcher Nf6.",
    tips: "Les Noirs visent c5 pour contester le centre ; l'aile dame noire est active dans ce schéma.",
  },
  {
    moves: ["e4", "e6", "d4", "d5", "exd5", "exd5"],
    name: "French Defense",
    variation: "Exchange Variation",
    eco: "C01",
    description: "L'échange simplifie immédiatement le centre ; souvent joué pour éviter la théorie complexe.",
    tips: "Position symétrique et souvent nulle ; les deux camps doivent trouver des déséquilibres subtils.",
  },
  {
    moves: ["e4", "e6", "d4", "d5", "Nd2"],
    name: "French Defense",
    variation: "Tarrasch Variation",
    eco: "C03",
    description: "Nd2 évite l'épinglage du cavalier tout en maintenant la pression sur d5.",
    tips: "Nd2 est moins actif que Nc3 mais plus solide ; les Noirs ont plusieurs réponses équilibrées.",
  },
  {
    moves: ["e4", "e6", "d4", "d5", "Nc3"],
    name: "French Defense",
    variation: null,
    eco: "C10",
    description: "Les Blancs développent naturellement et maintiennent la tension centrale.",
    tips: "La tension sur d5 est le thème central ; les Noirs ont le choix entre Bb4, Nf6, dxe4 ou c5.",
  },
  {
    moves: ["e4", "e6"],
    name: "French Defense",
    variation: null,
    eco: "C00",
    description: "Défense solide mais légèrement passive pour les Noirs, avec une structure de pions derrière la chaîne e6-d5.",
    tips: "Le fou de case blanche des Noirs sur c8 est souvent difficile à développer ; c'est la principale faiblesse.",
  },

  // Caro-Kann
  {
    moves: ["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4", "Bf5"],
    name: "Caro-Kann Defense",
    variation: "Classical Variation",
    eco: "B18",
    description: "Les Noirs développent leur fou avant de jouer e6, évitant l'enfermement du Caro-Kann.",
    tips: "Bf5 est le coup clé ; les Noirs obtiennent une structure solide avec leur fou de cases blanches actif.",
  },
  {
    moves: ["e4", "c6", "d4", "d5", "e5"],
    name: "Caro-Kann Defense",
    variation: "Advance Variation",
    eco: "B12",
    description: "Les Blancs gagnent de l'espace avec e5 mais les Noirs obtiennent une structure solide.",
    tips: "Bf5 est la réponse principale ; les Noirs visent à attaquer la chaîne de pions blanche avec c5 ou f6.",
  },
  {
    moves: ["e4", "c6", "d4", "d5", "exd5", "cxd5"],
    name: "Caro-Kann Defense",
    variation: "Exchange Variation",
    eco: "B13",
    description: "L'échange mène à une position symétrique de type structure Panov.",
    tips: "Les deux camps ont une structure équilibrée ; le jeu positionnel domine dans cette variante.",
  },
  {
    moves: ["e4", "c6", "d4", "d5", "Nc3"],
    name: "Caro-Kann Defense",
    variation: null,
    eco: "B15",
    description: "Les Blancs maintiennent la tension centrale et attendent la réaction des Noirs.",
    tips: "dxe4 menant à la Classique ou Nf6 sont les principales réponses des Noirs.",
  },
  {
    moves: ["e4", "c6"],
    name: "Caro-Kann Defense",
    variation: null,
    eco: "B10",
    description: "Réponse solide et positionnelle à 1.e4, préparant d5 avec un soutien en c6.",
    tips: "Plus solide que la Française car le fou de cases blanches reste libre ; souvent choisie par les joueurs défensifs.",
  },

  // Pirc Defense
  {
    moves: ["e4", "d6", "d4", "Nf6", "Nc3", "g6", "f4"],
    name: "Pirc Defense",
    variation: "Austrian Attack",
    eco: "B09",
    description: "L'Attaque Autrichienne est la réponse la plus agressive : f4 prépare une poussée f5 dévastatrice.",
    tips: "Les Noirs doivent contre-attaquer rapidement avec c5 ou e5 avant que l'attaque blanche ne soit irrésistible.",
  },
  {
    moves: ["e4", "d6", "d4", "Nf6", "Nc3", "g6"],
    name: "Pirc Defense",
    variation: null,
    eco: "B07",
    description: "Défense hypermoderne : les Noirs fianchettent leur fou roi et laissent les Blancs occuper le centre pour mieux l'attaquer.",
    tips: "Les Noirs doivent contre-attaquer avant que le centre blanc ne devienne écrasant.",
  },

  // Alekhine Defense
  {
    moves: ["e4", "Nf6", "e5", "Nd5", "d4", "d6", "c4", "Nb6", "exd6"],
    name: "Alekhine Defense",
    variation: "Exchange Variation",
    eco: "B03",
    description: "Les Blancs échangent les pions et obtiennent un léger avantage structurel.",
    tips: "Les Noirs ont une position solide mais doivent rester actifs pour éviter une pression positionnelle durable.",
  },
  {
    moves: ["e4", "Nf6", "e5", "Nd5", "d4", "d6", "c4"],
    name: "Alekhine Defense",
    variation: "Four Pawns Attack",
    eco: "B03",
    description: "L'Attaque des Quatre Pions est la réponse la plus ambitieuse : les Blancs construisent un centre massif.",
    tips: "Le centre blanc est imposant mais vulnérable ; les Noirs cherchent le moment pour l'exploser.",
  },
  {
    moves: ["e4", "Nf6"],
    name: "Alekhine Defense",
    variation: null,
    eco: "B02",
    description: "Stratégie hypermoderne : les Noirs provoquent immédiatement les pions blancs pour mieux les attaquer.",
    tips: "Les Blancs ne doivent pas trop étendre leur centre ; les Noirs attendent le bon moment pour contre-attaquer.",
  },

  // Scandinavian Defense
  {
    moves: ["e4", "d5", "exd5", "Qxd5", "Nc3", "Qa5"],
    name: "Scandinavian Defense",
    variation: "Main Line",
    eco: "B01",
    description: "Qa5 évite les attaques sur la dame mais la laisse temporairement déplacée.",
    tips: "Les Noirs doivent développer rapidement après Qa5 ; la dame noire peut être ciblée par Nb5 ou Bd2.",
  },
  {
    moves: ["e4", "d5", "exd5", "Nf6"],
    name: "Scandinavian Defense",
    variation: "Modern Variation",
    eco: "B01",
    description: "Les Noirs récupèrent le pion avec le cavalier plutôt que la dame, restant plus actifs.",
    tips: "Nxd5 ou c4 permettent aux Blancs de garder l'avantage d'espace ; les Noirs ont un jeu solide.",
  },
  {
    moves: ["e4", "d5"],
    name: "Scandinavian Defense",
    variation: null,
    eco: "B01",
    description: "La Scandinavian (Centre Counter) attaque le centre immédiatement avec d5, au prix d'un léger retard de développement.",
    tips: "Les Noirs doivent compenser le retard de développement par une activité rapide des pièces.",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // CLOSED GAMES — 1.d4 d5
  // ─────────────────────────────────────────────────────────────────────────────

  // Queen's Gambit Declined
  {
    moves: ["d4", "d5", "c4", "e6", "Nc3", "Nf6", "Bg5", "Be7", "e3", "O-O", "Nf3", "h6", "Bh4", "b6"],
    name: "Queen's Gambit Declined",
    variation: "Tartakower Variation",
    eco: "D58",
    description: "b6 prépare Bb7 pour libérer le jeu des Noirs dans cette défense active.",
    tips: "Les Noirs obtiennent un jeu actif en échange d'une légère faiblesse sur la colonne d ; nécessite précision.",
  },
  {
    moves: ["d4", "d5", "c4", "e6", "Nc3", "Nf6", "Bg5", "Be7", "e3", "O-O", "Nf3", "Nbd7", "Rc1", "c6"],
    name: "Queen's Gambit Declined",
    variation: "Orthodox Defense",
    eco: "D60",
    description: "L'une des défenses les plus solides et étudiées des échecs.",
    tips: "La minorité queenside (b4-b5) est le plan typique des Blancs pour créer des faiblesses dans le camp noir.",
  },
  {
    moves: ["d4", "d5", "c4", "e6", "Nc3", "Nf6", "Nf3", "Be7", "Bg5", "O-O", "e3", "Nbd7", "Bd3", "c5"],
    name: "Queen's Gambit Declined",
    variation: "Lasker Defense",
    eco: "D56",
    description: "La Défense Lasker vise l'échange des fous pour simplifier la position et viser la nullité.",
    tips: "Ne5 libère les Noirs mais affaiblit légèrement leur structure ; bon choix pour les joueurs défensifs.",
  },
  {
    moves: ["d4", "d5", "c4", "e6", "Nc3", "Nf6"],
    name: "Queen's Gambit Declined",
    variation: null,
    eco: "D30",
    description: "Défense classique et solide : les Noirs soutiennent d5 avec e6.",
    tips: "Le fou de cases blanches des Noirs sur c8 est souvent problématique ; le libérer est une priorité.",
  },

  // Queen's Gambit Accepted
  {
    moves: ["d4", "d5", "c4", "dxc4", "Nf3", "Nf6", "e3", "e6", "Bxc4"],
    name: "Queen's Gambit Accepted",
    variation: "Classical Defense",
    eco: "D26",
    description: "Les Noirs se développent normalement après avoir accepté le gambit.",
    tips: "Les Blancs récupèrent le pion et gardent un léger avantage de développement.",
  },
  {
    moves: ["d4", "d5", "c4", "dxc4"],
    name: "Queen's Gambit Accepted",
    variation: null,
    eco: "D20",
    description: "Les Noirs prennent le pion pour faciliter leur développement, surtout du fou de c8.",
    tips: "Les Blancs récupèrent généralement le pion et gardent un léger avantage d'espace au centre.",
  },

  // Slav Defense
  {
    moves: ["d4", "d5", "c4", "c6", "Nf3", "Nf6", "Nc3", "dxc4", "a4", "Bf5", "e3", "e6"],
    name: "Slav Defense",
    variation: "Semi-Slav — Meran",
    eco: "D47",
    description: "L'une des positions les plus complexes et théoriques des échecs modernes.",
    tips: "Le jeu explose souvent avec des sacrifices mutuels ; une connaissance approfondie de la théorie est indispensable.",
  },
  {
    moves: ["d4", "d5", "c4", "c6", "Nf3", "Nf6", "Nc3", "e6"],
    name: "Slav Defense",
    variation: "Semi-Slav",
    eco: "D43",
    description: "Combine les idées de la Slave et du Gambit Dame Refusé pour une défense solide et flexible.",
    tips: "Les Blancs peuvent choisir entre l'Anti-Meran, le Gambit Botvinnik et plusieurs autres systèmes aigus.",
  },
  {
    moves: ["d4", "d5", "c4", "c6", "Nf3", "Nf6", "Nc3", "dxc4"],
    name: "Slav Defense",
    variation: "Main Line",
    eco: "D15",
    description: "Les Noirs prennent le pion et essaient de le maintenir avec b5.",
    tips: "Les Blancs récupèrent le pion mais les Noirs obtiennent un développement actif en compensation.",
  },
  {
    moves: ["d4", "d5", "c4", "c6"],
    name: "Slav Defense",
    variation: null,
    eco: "D10",
    description: "c6 soutient d5 sans enfermer le fou de cases blanches, contrairement au Gambit Dame Refusé.",
    tips: "Défense solide et polyvalente ; le fou de cases blanches peut sortir avant que e6 ne le bloque.",
  },

  // Tarrasch Defense
  {
    moves: ["d4", "d5", "c4", "e6", "Nc3", "c5"],
    name: "Tarrasch Defense",
    variation: null,
    eco: "D32",
    description: "Les Noirs sacrifient l'isolani en d5 pour un jeu actif et dynamique.",
    tips: "Le pion isolé en d5 donne du dynamisme mais peut devenir une faiblesse en finale ; jeu actif indispensable.",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // INDIAN DEFENSES — 1.d4 Nf6
  // ─────────────────────────────────────────────────────────────────────────────

  // King's Indian Defense
  {
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6", "Nf3", "O-O", "Be2", "e5", "O-O", "Nc6", "d5", "Ne7", "Ne1"],
    name: "King's Indian Defense",
    variation: "Classical — Main Line",
    eco: "E99",
    description: "L'une des batailles les plus complexes et théoriques des échecs modernes.",
    tips: "Les deux camps ont des plans clairs (f4-f5 vs c5-c4) ; chaque coup est décisif dans cette lutte acharnée.",
  },
  {
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6", "Nf3", "O-O", "Be2", "e5", "O-O"],
    name: "King's Indian Defense",
    variation: "Classical Variation",
    eco: "E91",
    description: "La position de départ de la grande lutte centrale de la Roi Indienne.",
    tips: "Les Blancs jouent au centre avec d5, les Noirs contre-attaquent sur le flanc roi avec f5 ou Nbd7-f6.",
  },
  {
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6", "f3"],
    name: "King's Indian Defense",
    variation: "Samisch Variation",
    eco: "E81",
    description: "f3 soutient le centre et prépare Be3-Qd2 pour une attaque directe contre la Roi Indienne.",
    tips: "Les Noirs doivent contre-attaquer immédiatement avec c5 ou e5 ; position très tendue des deux côtés.",
  },
  {
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6", "Nf3", "O-O", "Bg5"],
    name: "King's Indian Defense",
    variation: "Averbakh Variation",
    eco: "E73",
    description: "Bg5 prépare Be3 et Qd2 pour une attaque posée mais solide.",
    tips: "Les Noirs répondent généralement par Na6 ou c5 pour chercher le contre-jeu.",
  },
  {
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6", "f4"],
    name: "King's Indian Defense",
    variation: "Four Pawns Attack",
    eco: "E76",
    description: "Les Blancs construisent un centre de quatre pions, la réponse la plus ambitieuse contre la Roi Indienne.",
    tips: "Le centre blanc est impressionnant mais fragile ; les Noirs cherchent à l'exploser avec c5 ou e5.",
  },
  {
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7", "e4", "d6"],
    name: "King's Indian Defense",
    variation: null,
    eco: "E70",
    description: "Ouverture hypermoderne où les Noirs laissent les Blancs occuper le centre pour mieux l'attaquer.",
    tips: "Le fianchetto du fou roi est l'arme principale ; les Noirs visent une contre-attaque vigoureuse.",
  },

  // Nimzo-Indian
  {
    moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4", "e3", "O-O", "Bd3", "d5", "Nf3", "c5"],
    name: "Nimzo-Indian Defense",
    variation: "Rubinstein Variation",
    eco: "E51",
    description: "La variante la plus populaire contre la Nimzo-Indienne : jeu positionnel et solide.",
    tips: "Les deux fous des Blancs deviennent puissants si les Noirs échangent leur Bb4 ; les Noirs doivent rester actifs.",
  },
  {
    moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4", "Qc2"],
    name: "Nimzo-Indian Defense",
    variation: "Classical Variation",
    eco: "E32",
    description: "4.Qc2 évite le doublement de pions ; les Blancs conservent leur structure intacte.",
    tips: "Les Noirs jouent souvent d5 ou c5 pour contester le centre ; position stratégique complexe.",
  },
  {
    moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4", "a3"],
    name: "Nimzo-Indian Defense",
    variation: "Samisch Variation",
    eco: "E26",
    description: "a3 force les Noirs à se décider sur leur fou : Bxc3+ ou Bd6 avec des plans différents.",
    tips: "Après Bxc3+, les Blancs ont le doublement de pions mais les deux fous dans un jeu ouvert.",
  },
  {
    moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"],
    name: "Nimzo-Indian Defense",
    variation: null,
    eco: "E20",
    description: "L'une des meilleures défenses des Noirs : elle épingle le cavalier et vise le doublement de pions blanc.",
    tips: "Défense active et stratégique ; les Noirs obtiennent une compensation structurelle.",
  },

  // Queen's Indian
  {
    moves: ["d4", "Nf6", "c4", "e6", "Nf3", "b6", "g3", "Bb7", "Bg2", "Be7", "O-O", "O-O"],
    name: "Queen's Indian Defense",
    variation: "Petrosian Variation",
    eco: "E12",
    description: "g3 et Bg2 préparent un centre ferme contre le fianchetto noir.",
    tips: "Les Blancs visent à exploiter la faiblesse potentielle sur c6 ; les Noirs compensent par l'activité sur la colonne b.",
  },
  {
    moves: ["d4", "Nf6", "c4", "e6", "Nf3", "b6", "g3"],
    name: "Queen's Indian Defense",
    variation: "Fianchetto Variation",
    eco: "E15",
    description: "Les Blancs répondent symétriquement avec g3 et Bg2 ; la lutte pour la grande diagonale est le thème principal.",
    tips: "Les deux camps fianchettent leur fou ; la domination de la diagonale b2-g7 est l'enjeu.",
  },
  {
    moves: ["d4", "Nf6", "c4", "e6", "Nf3", "b6"],
    name: "Queen's Indian Defense",
    variation: null,
    eco: "E12",
    description: "Fianchetto queenside avec b6 et Bb7 : un système solide pour contrôler e4.",
    tips: "Les Noirs visent à contrôler e4 avec leur fou ; stratégie hypermoderne et solide.",
  },

  // Grunfeld Defense
  {
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "d5", "cxd5", "Nxd5", "e4", "Nxc3", "bxc3", "Bg7", "Bc4"],
    name: "Grunfeld Defense",
    variation: "Classical Exchange",
    eco: "D86",
    description: "Les Blancs construisent un centre massif que les Noirs cherchent à détruire.",
    tips: "Le fou g7 et la pression sur d4 sont les armes principales des Noirs ; jeu très théorique.",
  },
  {
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "d5", "cxd5", "Nxd5", "e4", "Nxc3", "bxc3", "Bg7"],
    name: "Grunfeld Defense",
    variation: "Exchange Variation",
    eco: "D85",
    description: "Les Noirs cèdent le centre pour mieux l'attaquer dans cette variante principale.",
    tips: "Le centre blanc (d4-e4) est la cible principale des Noirs ; c5 et Qa5 sont des coups thématiques.",
  },
  {
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "d5"],
    name: "Grunfeld Defense",
    variation: null,
    eco: "D80",
    description: "Défense hypermoderne : les Noirs cèdent le centre puis l'attaquent avec leurs pièces.",
    tips: "Stratégie de contre-jeu pur ; les Noirs doivent savoir quand et comment exploser le centre blanc.",
  },

  // Bogo-Indian
  {
    moves: ["d4", "Nf6", "c4", "e6", "Nf3", "Bb4+"],
    name: "Bogo-Indian Defense",
    variation: null,
    eco: "E11",
    description: "Bb4+ provoque une réaction des Blancs et retarde le développement normal.",
    tips: "Moins ambitieuse que la Nimzo mais solide ; souvent utilisée pour éviter la théorie principale.",
  },

  // Benoni
  {
    moves: ["d4", "Nf6", "c4", "c5", "d5", "e6", "Nc3", "exd5", "cxd5", "d6", "e4", "g6", "Nf3", "Bg7"],
    name: "Benoni Defense",
    variation: "Modern Benoni",
    eco: "A70",
    description: "Les Noirs acceptent une faiblesse sur d6 pour un contre-jeu actif sur l'aile dame.",
    tips: "Le plan des Noirs est b5 puis Bb7 pour la grande diagonale ; les Blancs jouent f4-f5 pour attaquer.",
  },
  {
    moves: ["d4", "Nf6", "c4", "c5", "d5"],
    name: "Benoni Defense",
    variation: null,
    eco: "A60",
    description: "Déséquilibre immédiat : les Noirs obtiennent un contre-jeu dynamique sur le queenside.",
    tips: "Position asymétrique avec des plans clairs pour les deux camps ; jeu dynamique garanti.",
  },

  // Dutch Defense
  {
    moves: ["d4", "f5", "c4", "Nf6", "Nc3", "e6", "Nf3", "Bb4"],
    name: "Dutch Defense",
    variation: "Nimzo-Dutch",
    eco: "A90",
    description: "Combine les idées de la Nimzo-Indienne et de la Hollandaise pour une défense dynamique.",
    tips: "Les Noirs visent le contrôle de e4 et une attaque sur le roi adverse ; jeu actif indispensable.",
  },
  {
    moves: ["d4", "f5", "c4", "Nf6", "g3", "e6", "Bg2", "Be7", "Nf3", "O-O", "O-O", "d5"],
    name: "Dutch Defense",
    variation: "Stonewall Variation",
    eco: "A92",
    description: "La Muraille de Pierre : les Noirs créent une chaîne de pions solide sur d5-e6-f5 qui contrôle e4.",
    tips: "La case e5 est l'outpost idéal pour un cavalier noir ; les Noirs visent une attaque lente sur le roi.",
  },
  {
    moves: ["d4", "f5"],
    name: "Dutch Defense",
    variation: null,
    eco: "A80",
    description: "f5 prépare une attaque sur le roi blanc mais affaiblit l'aile roi des Noirs.",
    tips: "Ouverture à double tranchant ; les Blancs peuvent répondre avec e4 immédiatement via le Gambit Staunton.",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // FLANK OPENINGS
  // ─────────────────────────────────────────────────────────────────────────────

  // English Opening
  {
    moves: ["c4", "e5", "Nc3", "Nf6", "Nf3", "Nc6", "g3", "d5", "cxd5", "Nxd5", "Bg2"],
    name: "English Opening",
    variation: "Reversed Dragon",
    eco: "A29",
    description: "Les Blancs ont une version améliorée de la Sicilienne avec un tempo de plus.",
    tips: "Les Blancs ont le même plan que les Noirs dans le Dragon Sicilien, mais avec un tempo supplémentaire.",
  },
  {
    moves: ["c4", "c5", "Nf3", "Nf6", "Nc3", "d5", "cxd5", "Nxd5", "e3"],
    name: "English Opening",
    variation: "Symmetrical Variation",
    eco: "A33",
    description: "Les deux camps construisent des structures similaires, menant à un jeu positionnel fin.",
    tips: "La symétrie est souvent rompue rapidement ; les Blancs ont généralement un léger avantage avec le trait.",
  },
  {
    moves: ["c4", "e5", "Nc3"],
    name: "English Opening",
    variation: "Anglo-Indian",
    eco: "A21",
    description: "Les Blancs contrôlent d5 et visent un jeu positionnel sur le queenside.",
    tips: "Les Noirs peuvent répondre avec Nf6, f5, ou Bb4 pour des jeux différents.",
  },
  {
    moves: ["c4", "e5"],
    name: "English Opening",
    variation: "Reversed Sicilian",
    eco: "A20",
    description: "La Sicilienne Inversée : les Blancs jouent la Sicilienne avec un tempo de plus.",
    tips: "Jeu flexible qui peut transposer en de nombreuses structures ; les Blancs sont légèrement mieux développés.",
  },
  {
    moves: ["c4"],
    name: "English Opening",
    variation: null,
    eco: "A10",
    description: "Ouverture de flanc hypermoderne qui contrôle d5 sans occuper le centre immédiatement.",
    tips: "Flexible et stratégique ; conduit souvent à des structures indiennes ou à des Siciliennes renversées.",
  },

  // Reti Opening
  {
    moves: ["Nf3", "d5", "g3", "c5", "Bg2", "Nc6", "O-O", "e5"],
    name: "Reti Opening",
    variation: "King's Indian Attack",
    eco: "A05",
    description: "Les Blancs développent avec g3-Bg2 et visent e4 dans un plan de l'Attaque Roi Indien.",
    tips: "Très flexible ; les Blancs peuvent adapter leur plan selon la réponse des Noirs.",
  },
  {
    moves: ["Nf3", "d5", "c4"],
    name: "Reti Opening",
    variation: "Main Line",
    eco: "A09",
    description: "Les Blancs challengent d5 immédiatement avec c4 dans un style hypermoderne.",
    tips: "Les Noirs peuvent prendre avec dxc4, jouer d4 ou conserver la tension ; chaque choix mène à un jeu différent.",
  },
  {
    moves: ["Nf3", "d5", "g3"],
    name: "Reti Opening",
    variation: null,
    eco: "A05",
    description: "Ouverture hypermoderne : les Blancs contrôlent le centre à distance avec leur fianchetto.",
    tips: "Le fianchetto en g2 est typique ; peut transposer en Catalane ou en Anglaise.",
  },
  {
    moves: ["Nf3"],
    name: "Reti Opening",
    variation: null,
    eco: "A04",
    description: "Développement du cavalier laissant toutes les options ouvertes : c4, g3, d3 ou d4 sont tous possibles.",
    tips: "Ouverture hypermoderne très flexible ; les Blancs s'adaptent à la réponse des Noirs.",
  },

  // Catalan Opening
  {
    moves: ["d4", "Nf6", "c4", "e6", "g3", "d5", "Bg2", "Be7", "Nf3", "O-O", "O-O", "dxc4"],
    name: "Catalan Opening",
    variation: "Open Catalan",
    eco: "E04",
    description: "Les Noirs prennent le pion c4 et les Blancs cherchent à récupérer avec pression sur la colonne c.",
    tips: "Les Blancs ont une pression durable sur le queenside ; les Noirs doivent être précis pour neutraliser.",
  },
  {
    moves: ["d4", "Nf6", "c4", "e6", "g3", "d5", "Bg2", "Be7", "Nf3", "O-O", "O-O"],
    name: "Catalan Opening",
    variation: "Closed Catalan",
    eco: "E06",
    description: "Les Noirs maintiennent la tension dans le centre et cherchent à libérer leur jeu.",
    tips: "Le fou g2 exerce une pression latente sur le queenside ; les Noirs doivent libérer leur jeu avec c5 ou dxc4.",
  },
  {
    moves: ["d4", "Nf6", "c4", "e6", "g3", "d5", "Bg2"],
    name: "Catalan Opening",
    variation: null,
    eco: "E00",
    description: "Combine le Gambit Dame et le fianchetto du fou roi pour une pression positionnelle profonde.",
    tips: "Le fou g2 est très puissant dans cette ouverture ; les Noirs doivent résoudre le problème du développement de leur queenside.",
  },

  // London System
  {
    moves: ["d4", "d5", "Nf3", "Nf6", "Bf4", "e6", "e3", "Bd6", "Bxd6", "Qxd6", "c4"],
    name: "London System",
    variation: "Jobava London",
    eco: "D02",
    description: "La Variante Jobava combine Londres avec Nc3 pour une attaque plus agressive que le Londres classique.",
    tips: "Plus ambitieux que le Londres standard ; les Blancs visent une attaque directe avec des pièces actives.",
  },
  {
    moves: ["d4", "d5", "Nf3", "Nf6", "Bf4", "e6", "e3"],
    name: "London System",
    variation: null,
    eco: "D02",
    description: "Système solide et simple : les Blancs développent leur fou avant de jouer e3.",
    tips: "Idéal pour éviter la théorie complexe ; plan clair et défensif avec une structure pyramidale solide.",
  },
  {
    moves: ["d4", "Nf6", "Nf3", "e6", "Bf4"],
    name: "London System",
    variation: "vs King's Indian Setup",
    eco: "A46",
    description: "Le Système de Londres contre les Indiennes : structure solide quelle que soit la réponse noire.",
    tips: "Bf4 doit être joué avant e3 pour éviter d'être chassé par Nh5 ; l'ordre de coups est important.",
  },
  {
    moves: ["d4", "d5", "Bf4"],
    name: "London System",
    variation: null,
    eco: "D00",
    description: "Le London peut se jouer contre presque tout ; très flexible et solide.",
    tips: "Développement naturel : Bf4, e3, Nf3, Be2, O-O ; structure pyramidale typique.",
  },

  // King's Indian Attack
  {
    moves: ["e4", "e6", "d3", "d5", "Nd2", "Nf6", "Ngf3", "c5", "g3", "Nc6", "Bg2", "Be7", "O-O"],
    name: "King's Indian Attack",
    variation: "vs French",
    eco: "A07",
    description: "Système positionnel populaire pour éviter la théorie Française.",
    tips: "Le plan est e5 ou exd5 suivi d'une attaque sur le roi avec Nh4-f5 ou h4.",
  },
  {
    moves: ["e4", "c5", "Nf3", "e6", "d3", "Nc6", "g3", "Nf6", "Bg2"],
    name: "King's Indian Attack",
    variation: "vs Sicilian",
    eco: "A07",
    description: "Les Blancs évitent l'Open Sicilienne avec un plan de développement solide.",
    tips: "Le plan habituel est O-O puis Nbd2-e4 pour contrôler d6 et préparer l'attaque.",
  },
  {
    moves: ["Nf3", "d5", "g3", "Nf6", "Bg2", "e6", "O-O"],
    name: "King's Indian Attack",
    variation: null,
    eco: "A07",
    description: "Système flexible avec g3-Bg2 qui peut être utilisé contre de nombreuses défenses.",
    tips: "Très populaire comme arme secrète ; Fischer l'utilisait régulièrement avec succès contre la Sicilienne.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sort book: longest sequence first for greedy most-specific matching
// ─────────────────────────────────────────────────────────────────────────────
const SORTED_BOOK = [...OPENING_BOOK].sort(
  (a, b) => b.moves.length - a.moves.length,
);

/**
 * Identifies the most specific chess opening for a given move sequence.
 *
 * Iterates through the opening book sorted by length (longest first).
 * Returns the first entry whose move sequence is a prefix of `history`.
 *
 * @param {string[]} history - Array of SAN moves (e.g. ["e4", "c5", "Nf3"])
 * @returns {OpeningResult|null} The most specific matching opening, or null if none found.
 *
 * @example
 * identifyOpening(["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"])
 * // => { name: "Sicilian Defense", variation: "Najdorf Variation", eco: "B90", ... }
 */
export function identifyOpening(history) {
  if (!Array.isArray(history) || history.length === 0) return null;

  for (const entry of SORTED_BOOK) {
    if (entry.moves.length > history.length) continue;

    const matches = entry.moves.every((move, i) => move === history[i]);
    if (matches) {
      return {
        name: entry.name,
        variation: entry.variation,
        eco: entry.eco,
        description: entry.description,
        tips: entry.tips,
      };
    }
  }

  return null;
}

export default { identifyOpening };
