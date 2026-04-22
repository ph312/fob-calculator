export type ContainerBodyTypeId =
  | "minivan"
  | "short_minivan_hatchback_bongo"
  | "sedan_over_460"
  | "hatchback"
  | "small_car_truck";

export type ContainerBodyTypeOption = {
  id: ContainerBodyTypeId;
  /** Короткий заголовок на кнопке */
  label: string;
  /** Текст после «В эту категорию входят:» */
  inclusion: string;
};

/** Категории кузова для справочного блока контейнера (без привязки к конкретной модели в расчёте). */
export const CONTAINER_BODY_TYPE_OPTIONS: ContainerBodyTypeOption[] = [
  {
    id: "minivan",
    label: "Минивэн",
    inclusion:
      "ALPHARD, DELICA, ELGRAND, ELYSION, NOAH, SERENA, STEP W, VOXY, TOYOTA LAND CRUISER PRADO, CAYENNE, VELLFIRE, ODYSSEY",
  },
  {
    id: "short_minivan_hatchback_bongo",
    label: "Минивэн короткий / хэтчбек / грузовики типа Bongo T, Vanette T",
    inclusion:
      "IPSUM, ISIS, WISH, ACTY VAN, RACTIS, SIENTA, SX4, MERS B CLASS, LEAF, PRIUS, EK-WAGON, JUKE, N ONE, TANTO, IGNIS, HUSTLER, DAYZ, CX-3, PORTE, IMPREZA XV, FLAIR, CH-R, TIIDA, TIIDA LATIO",
  },
  {
    id: "sedan_over_460",
    label: "Все седаны длиннее 460 см",
    inclusion: "ACCORD, BMW 5SERIES, CAMRY, MERCEDES E CLASS, CLS, FUGA, MARK X",
  },
  {
    id: "hatchback",
    label: "Хэтчбеки",
    inclusion: "Например: Golf, Civic, A-Class, Note",
  },
  {
    id: "small_car_truck",
    label: "Малолитражки / SMALL TRUCKS (без будки)",
    inclusion:
      "Например: Colt, Demio, Fit, Ist, March, Mini, Passo, Polo, Swift, Vitz, Hijet Truck, Sambar T, Minicab T, Acty T, Clipper T, Carry Truck",
  },
];
