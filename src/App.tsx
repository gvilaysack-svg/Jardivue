import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

type Plant = {
  id: number;
  name: string;
  latin_name: string;
  pos_x: number;
  pos_y: number;
  watering: string;
  pruning: string;
  exposure: string;
  hardiness: string;
  image_url: string;
  plant_type: string;
  adult_diameter: number;
  watering_months: string;
pruning_months: string;
fertilizing_months: string;
planting_date: string;
purchase_price: number;
purchase_place: string;
notes: string;
};

type Zone = {
  id: number;
  name: string;
  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
  color: string;
};

function App() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [plantLibrary, setPlantLibrary] = useState<any[]>([]);
const [selectedLibraryPlant, setSelectedLibraryPlant] = useState("");
  const [zones, setZones] = useState<Zone[]>([]);
  const [currentMonth] = useState(
    
  new Date().toLocaleString("fr-FR", { month: "long" })
);
const months = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

const [selectedMonth, setSelectedMonth] = useState(currentMonth);
const [maintenanceDone, setMaintenanceDone] = useState<any[]>([]);
  const [plantLogs, setPlantLogs] = useState<any[]>([]);
  
const [newLog, setNewLog] = useState("");
const [logImage, setLogImage] = useState<File | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  
  const [draggedPlantId, setDraggedPlantId] = useState<number | null>(null);
  const [showPlantNames, setShowPlantNames] = useState(false);
  const [showAdultSize, setShowAdultSize] = useState(true);
  const [highlightedPlantId, setHighlightedPlantId] = useState<number | null>(null);
  const [designMode, setDesignMode] = useState(false);
const [designPlant, setDesignPlant] = useState("");
const [selectedDesignZone, setSelectedDesignZone] = useState("");
  const [newName, setNewName] = useState("");
  const [newLatinName, setNewLatinName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
const [allPlantLogs, setAllPlantLogs] = useState<any[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panMode, setPanMode] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, panX: 0, panY: 0 });

  const [measureMode, setMeasureMode] = useState(false);
  const [measurePlants, setMeasurePlants] = useState<Plant[]>([]);

  const backgroundImage =
    "https://mhtacyaqhztbgtyikpnc.supabase.co/storage/v1/object/public/garden-images/terrain%202.png";

  const PIXELS_PER_METER = 14.72;
  const scaleBarMeters = 10;
  const scaleBarPixels = scaleBarMeters * PIXELS_PER_METER;

  useEffect(() => {
  getPlants();
  getZones();
  getPlantLibrary();
  getMaintenanceDone();
  getAllPlantLogs();
}, []);

  async function getPlants() {
    const { data, error } = await supabase.from("plants").select("*");
    if (error) return console.error(error);
    setPlants(data || []);
  }
  async function markTaskDone(
  plantId: number,
  taskType: string
) {
  await supabase
    .from("maintenance_done")
    .insert({
      plant_id: plantId,
      task_type: taskType,
      done_month: currentMonth,
    });

  getMaintenanceDone();
}
async function getAllPlantLogs() {
  const { data, error } = await supabase
    .from("plant_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  setAllPlantLogs(data || []);
}
  async function getMaintenanceDone() {
  const { data } = await supabase
    .from("maintenance_done")
    .select("*");

  setMaintenanceDone(data || []);
}

  async function getZones() {
    const { data, error } = await supabase.from("zones").select("*");
    if (error) return console.error(error);
    setZones(data || []);
  }
async function getPlantLibrary() {
  const { data, error } = await supabase
    .from("plant_library")
    .select("*")
    .order("name");

  if (error) {
    console.error(error);
    return;
  }

  setPlantLibrary(data || []);
}
async function getPlantLogs(plantId: number) {
  const { data, error } = await supabase
    .from("plant_logs")
    .select("*")
    .eq("plant_id", plantId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  setPlantLogs(data || []);
}
  async function addPlant() {
    if (!newName.trim()) return;

    const { data, error } = await supabase
      .from("plants")
      .insert({
        name: newName,
        latin_name: newLatinName,
        pos_x: 300,
        pos_y: 250,
        watering: "À définir",
        pruning: "À définir",
        exposure: "À définir",
        hardiness: "À définir",
        image_url: "",
        plant_type: "Arbuste",
        adult_diameter: 2,
      })
      .select()
      .single();

    if (error) return console.error(error);

    setPlants((current) => [...current, data]);
    setSelectedPlant(data);
    setHighlightedPlantId(data.id);
    setNewName("");
    setNewLatinName("");
  }
async function addPlantFromLibrary() {
  if (!selectedLibraryPlant) return;

  const libraryPlant = plantLibrary.find(
    (p) => p.id.toString() === selectedLibraryPlant
  );

  if (!libraryPlant) return;

  const { data, error } = await supabase
    .from("plants")
    .insert({
      name: libraryPlant.name,
      latin_name: libraryPlant.latin_name,
      plant_type: libraryPlant.plant_type,
      adult_diameter: libraryPlant.adult_diameter,
      watering: libraryPlant.watering,
      pruning: libraryPlant.pruning,
      exposure: libraryPlant.exposure,
      hardiness: libraryPlant.hardiness,
      watering_months: libraryPlant.watering_months,
      pruning_months: libraryPlant.pruning_months,
      fertilizing_months: libraryPlant.fertilizing_months,
      pos_x: 300,
      pos_y: 250,
      image_url: "",
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return;
  }

  setPlants((current) => [...current, data]);
  setSelectedPlant(data);
  setHighlightedPlantId(data.id);
  setSelectedLibraryPlant("");
}
  async function updatePlantPosition(id: number, x: number, y: number) {
    const { error } = await supabase
      .from("plants")
      .update({ pos_x: x, pos_y: y })
      .eq("id", id);

    if (error) console.error("Erreur sauvegarde position :", error);
  }

  function getPlantIcon(type: string) {
    switch (type) {
      case "Arbre":
        return "🌳";
      case "Fruitier":
        return "🍎";
      case "Arbuste":
        return "🌿";
      case "Rosier":
        return "🌹";
      case "Palmier":
        return "🌴";
      case "Vivace":
        return "🌼";
      case "Potager":
        return "🥕";
      case "Conifère":
        return "🌲";
      case "Grimpante":
        return "🍃";
      case "Haie":
        return "🟩";
      default:
        return "🌱";
    }
  }

  function getDistanceMeters(a: Plant, b: Plant) {
    const dx = a.pos_x - b.pos_x;
    const dy = a.pos_y - b.pos_y;
    const distancePixels = Math.sqrt(dx * dx + dy * dy);
    return distancePixels / PIXELS_PER_METER;
  }

  function searchPlant() {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return;

    const foundPlant = plants.find((plant) =>
      plant.name.toLowerCase().includes(normalizedSearch)
    );

    if (!foundPlant) {
      alert("Aucune plante trouvée");
      return;
    }

    setSelectedPlant(foundPlant);
    setHighlightedPlantId(foundPlant.id);
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const mapX = (mouseX - pan.x) / zoom;
    const mapY = (mouseY - pan.y) / zoom;

    const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.4), 3);

    setZoom(newZoom);
    setPan({
      x: mouseX - mapX * newZoom,
      y: mouseY - mapY * newZoom,
    });
  }

  function handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    if (!panMode) return;

    setIsPanning(true);
    setPanStart({
      x: event.clientX,
      y: event.clientY,
      panX: pan.x,
      panY: pan.y,
    });
  }

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (isPanning) {
      setPan({
        x: panStart.panX + event.clientX - panStart.x,
        y: panStart.panY + event.clientY - panStart.y,
      });
      return;
    }

    if (draggedPlantId === null) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.round((event.clientX - rect.left - pan.x) / zoom);
    const y = Math.round((event.clientY - rect.top - pan.y) / zoom);

    setPlants((currentPlants) =>
      currentPlants.map((plant) =>
        plant.id === draggedPlantId ? { ...plant, pos_x: x, pos_y: y } : plant
      )
    );

    setSelectedPlant((current) =>
      current?.id === draggedPlantId ? { ...current, pos_x: x, pos_y: y } : current
    );
  }

  async function handleMouseUp() {
    setIsPanning(false);

    if (draggedPlantId === null) return;

    const plant = plants.find((p) => p.id === draggedPlantId);
    if (plant) await updatePlantPosition(plant.id, plant.pos_x, plant.pos_y);

    setDraggedPlantId(null);
  }

  function handlePlantClick(plant: Plant) {
    setSelectedPlant(plant);
    getPlantLogs(plant.id);
    setHighlightedPlantId(plant.id);

    if (!measureMode) return;

    setMeasurePlants((current) => {
      if (current.length === 0) return [plant];
      if (current.length === 1) {
        if (current[0].id === plant.id) return current;
        return [current[0], plant];
      }
      return [plant];
    });
  }
function focusPlantOnMap(plant: Plant) {
  setSelectedPlant(plant);
  setHighlightedPlantId(plant.id);
  getPlantLogs(plant.id);

  setZoom(1.5);
  setPan({
    x: 450 - plant.pos_x * 1.5,
    y: 450 - plant.pos_y * 1.5,
  });
}
  async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    if (!selectedPlant) return;

    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = `${selectedPlant.id}-${Date.now()}-${file.name}`;

    const { error } = await supabase.storage.from("plants").upload(fileName, file);
    if (error) return console.error(error);

    const {
      data: { publicUrl },
    } = supabase.storage.from("plants").getPublicUrl(fileName);

    await supabase
      .from("plants")
      .update({ image_url: publicUrl })
      .eq("id", selectedPlant.id);

    setPlants((current) =>
      current.map((plant) =>
        plant.id === selectedPlant.id ? { ...plant, image_url: publicUrl } : plant
      )
    );

    setSelectedPlant({ ...selectedPlant, image_url: publicUrl });
  }
async function addPlantLog() {
  if (!selectedPlant || !newLog.trim()) return;

  let imageUrl = "";

  if (logImage) {
    const fileName = `${selectedPlant.id}-${Date.now()}-${logImage.name}`;

    const { error: uploadError } = await supabase.storage
      .from("plant-logs")
      .upload(fileName, logImage);

    if (uploadError) {
      console.error(uploadError);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("plant-logs")
      .getPublicUrl(fileName);

    imageUrl = publicUrl;
  }

  const { error } = await supabase
    .from("plant_logs")
    .insert({
      plant_id: selectedPlant.id,
      note: newLog,
      image_url: imageUrl,
    });

  if (error) {
    console.error(error);
    return;
  }

  setNewLog("");
  setLogImage(null);

  getPlantLogs(selectedPlant.id);
}
  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  const measuredDistance =
  measurePlants.length === 2
    ? getDistanceMeters(measurePlants[0], measurePlants[1])
    : null;

const recommendedDistance =
  measurePlants.length === 2
    ? (measurePlants[0].adult_diameter || 0) / 2 +
      (measurePlants[1].adult_diameter || 0) / 2
    : null;

const hasConflict =
  measuredDistance !== null &&
  recommendedDistance !== null &&
  measuredDistance < recommendedDistance;

const gardenArea = 4700;

const totalPlants = plants.length;

const plantTypeCounts = plants.reduce((acc, plant) => {
  const type = plant.plant_type || "Non défini";
  acc[type] = (acc[type] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const occupiedArea = plants.reduce((total, plant) => {
  const diameter = plant.adult_diameter || 0;
  const radius = diameter / 2;
  return total + Math.PI * radius * radius;
}, 0);

const availableArea = gardenArea - occupiedArea;
const totalGardenValue = plants.reduce(
  (total, plant) => total + (plant.purchase_price || 0),
  0
);
const photoCount = plantLogs.filter(
  (log) => log.image_url
).length;

const observationCount = plantLogs.length;

const lastObservation =
  plantLogs.length > 0
    ? plantLogs[0].created_at
    : null;
let followStatus = "🔴 Aucun suivi";
let followColor = "#c62828";

if (lastObservation) {
  const daysSinceLastLog = Math.floor(
    (Date.now() - new Date(lastObservation).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastLog <= 30) {
    followStatus = "🟢 Suivi récent";
    followColor = "#2e7d32";
  } else if (daysSinceLastLog <= 60) {
    followStatus = "🟠 À surveiller";
    followColor = "#ef6c00";
  }
}




function includesSelectedMonth(monthsText: string) {
  if (!monthsText) return false;

  return monthsText
    .split(",")
    .map((month) => month.trim().toLowerCase())
    .includes(selectedMonth.toLowerCase());
}

const wateringTasks = plants.filter(
  (plant) =>
    includesSelectedMonth(plant.watering_months) &&
    !isTaskDone(plant.id, "watering")
);

const pruningTasks = plants.filter((plant) =>
  includesSelectedMonth(plant.pruning_months)
);

const fertilizingTasks = plants.filter((plant) =>
  includesSelectedMonth(plant.fertilizing_months)
);
function getPlantAge(dateString: string) {
  if (!dateString) return "Non renseigné";

  const plantingDate = new Date(dateString);
  const today = new Date();

  let years = today.getFullYear() - plantingDate.getFullYear();
  let months = today.getMonth() - plantingDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years <= 0 && months <= 0) {
    return "Plantée récemment";
  }

  if (years <= 0) {
    return `${months} mois`;
  }

  if (months <= 0) {
    return `${years} an${years > 1 ? "s" : ""}`;
  }

  return `${years} an${years > 1 ? "s" : ""} et ${months} mois`;
}
const selectedDesignPlant = plantLibrary.find(
  (p) => p.id.toString() === designPlant
);

const designDiameter = selectedDesignPlant?.adult_diameter || 0;

const designSpacing = designDiameter;

const designArea = Math.PI * Math.pow(designDiameter / 2, 2);

const possiblePlants =
  designArea > 0 ? Math.floor(availableArea / designArea) : 0;
  const selectedZone = zones.find(
  (zone) => zone.name === selectedDesignZone
);

const selectedZoneArea =
  selectedZone
    ? (selectedZone.width / PIXELS_PER_METER) *
      (selectedZone.height / PIXELS_PER_METER)
    : 0;




    
    const possiblePlantsInZone =
  designArea > 0 && selectedZoneArea > 0
    ? Math.floor(selectedZoneArea / designArea)
    : 0;



function isTaskDone(plantId: number, taskType: string) {
  return maintenanceDone.some(
    (task) =>
      task.plant_id === plantId &&
      task.task_type === taskType &&
      task.done_month === currentMonth
  );
}

const plantLogsForThisPlant = selectedPlant
  ? plantLogs.filter(
      (log) => log.plant_id === selectedPlant.id
    )
  : [];

const lastLogForThisPlant = plantLogsForThisPlant[0];
let plantFollowDot = "🔴";

if (lastLogForThisPlant) {
  const daysSinceLastLog = Math.floor(
    (Date.now() - new Date(lastLogForThisPlant.created_at).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastLog < 30) {
    plantFollowDot = "🟢";
  } else if (daysSinceLastLog < 90) {
    plantFollowDot = "🟠";
  }
}
function includesSelectedMonthForCalendar(monthsText: string, month: string) {
  if (!monthsText) return false;

  return monthsText
    .split(",")
    .map((m) => m.trim().toLowerCase())
    .includes(month.toLowerCase());
}
return (
  <div
    style={{
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "220px 1fr",
      background: "linear-gradient(180deg, #f3f0e8 0%, #e8efe4 100%)",
      fontFamily: "Inter, system-ui, Arial",
      color: "#263128",
    }}
  >
    <aside
      style={{
        background: "#1f4d2b",
        color: "white",
        padding: 24,
        minHeight: "100vh",
        boxShadow: "8px 0 30px rgba(31,77,43,0.18)",
      }}
    >
      <h2 style={{ marginTop: 0 }}>JardiVue</h2>

      <div style={{ opacity: 0.75, marginBottom: 30 }}>
        Carnet de jardin
      </div>

      <nav style={{ display: "grid", gap: 12 }}>
       <div
  style={{
    padding: 14,
    borderRadius: 14,
    background: "rgba(255,255,255,0.12)",
    fontWeight: "bold",
  }}
>
  🏠 Tableau de bord
</div>

<div style={{ padding: 14 }}>🗺️ Carte</div>
<div style={{ padding: 14 }}>📅 Travaux</div>
<div style={{ padding: 14 }}>🌱 Plantes</div>
<div style={{ padding: 14 }}>📷 Journal</div>
      </nav>
      <div
  style={{
    marginTop: 24,
    padding: 16,
    background: "rgba(255,255,255,0.10)",
    borderRadius: 16,
  }}
>
  <div style={{ fontSize: 12, opacity: 0.8 }}>Surface</div>
  <div style={{ fontSize: 26, fontWeight: "bold" }}>4700 m²</div>

  <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
    Plantes
  </div>
  <div style={{ fontSize: 26, fontWeight: "bold" }}>
    {plants.length}
  </div>

  <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
    Surface libre
  </div>
  <div style={{ fontSize: 22, fontWeight: "bold" }}>
    {availableArea.toFixed(0)} m²
  </div>
</div>

<div
  style={{
    marginTop: 16,
    padding: 16,
    background: "rgba(255,255,255,0.10)",
    borderRadius: 16,
  }}
>
  <div style={{ fontWeight: "bold", marginBottom: 8 }}>
    📅 Ce mois-ci
  </div>

  <div>💧 {wateringTasks.length} arrosages</div>
  <div>✂️ {pruningTasks.length} tailles</div>
  <div>🌱 {fertilizingTasks.length} engrais</div>
</div>
    </aside>

    <main style={{ padding: 24 }}>
  
    <div
  style={{
    background: "linear-gradient(135deg, #1f4d2b, #386b43)",
    color: "white",
    padding: 28,
    borderRadius: 28,
    marginBottom: 24,
    boxShadow: "0 18px 40px rgba(31,77,43,0.25)",
  }}
>
  <div
    style={{
      fontSize: 14,
      opacity: 0.8,
      marginBottom: 8,
    }}
  >
    Carnet de jardin
  </div>

  <h1
    style={{
      margin: 0,
      fontSize: 40,
      letterSpacing: -1,
    }}
  >
    JardiVue
  </h1>

  <p
    style={{
      marginTop: 10,
      opacity: 0.85,
      fontSize: 16,
    }}
  >
    Suivi, plantations et entretien de mon jardin
  </p>
</div>
      
<div
  style={{
    display: "flex",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 20,
  }}
>

  <div style={{
    padding: 12,
    background: "#ffffff",
    boxShadow: "0 12px 30px rgba(31,77,43,0.08)",
    borderRadius: 16,
    border: "1px solid rgba(31,77,43,0.08)",
    minWidth: 130,
  }}>
    <strong>📐 Terrain</strong>
    <div>{gardenArea} m²</div>
  </div>

  <div style={{
    padding: 12,
    background: "#ffffff",
    boxShadow: "0 12px 30px rgba(31,77,43,0.08)",
    borderRadius: 16,
    border: "1px solid rgba(31,77,43,0.08)",
    minWidth: 130,
  }}>
    <strong>🌳 Surface occupée</strong>
    <div>{occupiedArea.toFixed(1)} m²</div>
  </div>

  <div style={{
    padding: 12,
    background: "#ffffff",
    boxShadow: "0 12px 30px rgba(31,77,43,0.08)",
    borderRadius: 16,
    border: "1px solid rgba(31,77,43,0.08)",
    minWidth: 130,
  }}>
    <strong>💰 Valeur jardin</strong>
    <div>{totalGardenValue.toFixed(2)} €</div>
  </div>

  {Object.entries(plantTypeCounts).map(([type, count]) => (
    <div
      key={type}
      style={{
        padding: 20,
        background: "linear-gradient(145deg, #ffffff, #f7faf7)",
        boxShadow: "0 15px 35px rgba(31,77,43,0.15)",
        borderRadius: 24,
        border: "1px solid rgba(31,77,43,0.10)",
        minWidth: 180,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 8 }}>
        {type === "Arbre" ? "🌳" :
         type === "Palmier" ? "🌴" :
         type === "Arbuste" ? "🌿" : "🪴"}
      </div>

      <div style={{ fontSize: 18, fontWeight: "bold", color: "#1f4d2b" }}>
        {type}
      </div>

      <div style={{ fontSize: 28, fontWeight: "bold", color: "#386b43", marginTop: 8 }}>
        {count}
      </div>
    </div>
  ))}

  

  <h2 style={{ marginTop: 0 }}>
    📅 Calendrier annuel des travaux
  </h2>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 16,
    }}
  >
    {[
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ].map((month) => (
      <div
        key={month}
        style={{
          padding: 14,
          borderRadius: 14,
          background: "#f8faf8",
          border: "1px solid #e6eee6",
        }}
      >
        <strong>{month}</strong>

        <div style={{ marginTop: 10, fontSize: 13 }}>
  {plants
    .filter((plant) =>
      includesSelectedMonthForCalendar(plant.watering_months, month)
    )
   .map((plant) => (
  <div
    key={`water-${month}-${plant.id}`}
    onClick={() => focusPlantOnMap(plant)}
    style={{
  cursor: "pointer",
  padding: "6px 8px",
  borderRadius: 8,
  transition: "all 0.2s ease",
}}
onMouseEnter={(e) => {
  e.currentTarget.style.background = "#e8f5e9";
}}
onMouseLeave={(e) => {
  e.currentTarget.style.background = "transparent";
}}
  >
    💧 {plant.name}
  </div>
))}

  {plants
    .filter((plant) =>
      includesSelectedMonthForCalendar(plant.pruning_months, month)
    )
    .map((plant) => (
      <div
  key={`prune-${month}-${plant.id}`}
  onClick={() => focusPlantOnMap(plant)}
 style={{
  cursor: "pointer",
  padding: "6px 8px",
  borderRadius: 8,
  transition: "all 0.2s ease",
}}
  onMouseEnter={(e) => {
  e.currentTarget.style.background = "#e8f5e9";
}}
onMouseLeave={(e) => {
  e.currentTarget.style.background = "transparent";
}}
>
  ✂️ {plant.name}
</div>
    ))}

  {plants
    .filter((plant) =>
      includesSelectedMonthForCalendar(plant.fertilizing_months, month)
    )
    .map((plant) => (
     <div
  key={`fert-${month}-${plant.id}`}
  onClick={() => focusPlantOnMap(plant)}
 style={{
  cursor: "pointer",
  padding: "6px 8px",
  borderRadius: 8,
  transition: "all 0.2s ease",
}}
onMouseEnter={(e) => {
  e.currentTarget.style.background = "#e8f5e9";
}}
onMouseLeave={(e) => {
  e.currentTarget.style.background = "transparent";
}}
>
  🌱 {plant.name}
</div>
    ))}
</div>
      </div>
    ))}
  </div>
</div>
      <div style={{ marginBottom: 16 }}>
        <select
  value={selectedLibraryPlant}
  onChange={(e) => setSelectedLibraryPlant(e.target.value)}
  style={{
  padding: "10px 14px",
  borderRadius: 14,
  border: "1px solid rgba(31,77,43,0.12)",
  background: "white",
  color: "#1f4d2b",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 6px 16px rgba(31,77,43,0.08)",
}}
>
  <option value="">Choisir une plante</option>

  {plantLibrary.map((plant) => (
    <option key={`water-${plant.id}`} value={plant.id}>
      {plant.name}
    </option>
  ))}
</select>

<button
  onClick={addPlantFromLibrary}
  style={{
  padding: "10px 14px",
  borderRadius: 14,
  border: "1px solid rgba(31,77,43,0.12)",
  background: "white",
  color: "#1f4d2b",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 6px 16px rgba(31,77,43,0.08)",
}}
>
  🌿 Ajouter depuis la bibliothèque
</button>
        <input
          placeholder="Nom de la plante"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
         style={{
  padding: "10px 14px",
  borderRadius: 14,
  border: "1px solid rgba(31,77,43,0.12)",
  background: "white",
  color: "#1f4d2b",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 6px 16px rgba(31,77,43,0.08)",
}}
        />

        <input
          placeholder="Nom latin"
          value={newLatinName}
          onChange={(e) => setNewLatinName(e.target.value)}
         style={{
  padding: "10px 14px",
  borderRadius: 14,
  border: "1px solid rgba(31,77,43,0.12)",
  background: "white",
  color: "#1f4d2b",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 6px 16px rgba(31,77,43,0.08)",
}}
        />

        <button onClick={addPlant} style={{ padding: 8, marginRight: 8 }}>
          ➕ Ajouter une plante
        </button>

        <button onClick={() => setShowPlantNames(!showPlantNames)} style={{
  padding: "10px 14px",
  borderRadius: 14,
  border: "1px solid rgba(31,77,43,0.12)",
  background: "white",
  color: "#1f4d2b",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 6px 16px rgba(31,77,43,0.08)",
}}>
          {showPlantNames ? "Masquer les noms" : "Afficher les noms"}
        </button>
      </div>
<button
  onClick={() => setShowAdultSize(!showAdultSize)}
  style={{ padding: 8 }}
>
  {showAdultSize ? "Masquer taille adulte" : "Afficher taille adulte"}
</button>
      <div
  style={{
    marginBottom: 20,
    padding: 14,
    background: "rgba(255,255,255,0.85)",
    borderRadius: 24,
    boxShadow: "0 12px 30px rgba(31,77,43,0.10)",
    border: "1px solid rgba(31,77,43,0.08)",
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  }}
>
        <input
          placeholder="Rechercher une plante"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") searchPlant();
          }}
          style={{ padding: 8, marginRight: 8, width: 260 }}
        />

        <button onClick={searchPlant} style={{
  padding: "10px 14px",
  borderRadius: 14,
  border: "1px solid rgba(31,77,43,0.12)",
  background: "white",
  color: "#1f4d2b",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 6px 16px rgba(31,77,43,0.08)",
}}>
          🔍 Rechercher
        </button>

        <button onClick={() => setZoom((z) => Math.min(z + 0.2, 3))} style={{
  padding: "10px 14px",
  borderRadius: 14,
  border: "1px solid rgba(31,77,43,0.12)",
  background: "white",
  color: "#1f4d2b",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 6px 16px rgba(31,77,43,0.08)",
}}>
          +
        </button>

        <button onClick={() => setZoom((z) => Math.max(z - 0.2, 0.4))} style={{
  padding: "10px 14px",
  borderRadius: 14,
  border: "1px solid rgba(31,77,43,0.12)",
  background: "white",
  color: "#1f4d2b",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 6px 16px rgba(31,77,43,0.08)",
}}>
          -
        </button>

        <button onClick={resetView} style={{ padding: 8, marginLeft: 8 }}>
          Reset
        </button>

        <button
          onClick={() => setPanMode(!panMode)}
          style={{
            padding: 8,
            marginLeft: 8,
            background: panMode ? "#2f5d3a" : "#eee",
            color: panMode ? "white" : "black",
          }}
        >
          {panMode ? "Mode déplacement carte" : "Mode déplacement plantes"}
        </button>

        <button
  onClick={() => {
    setMeasureMode(!measureMode);
    setMeasurePlants([]);
  }}
  style={{
    padding: 8,
    marginLeft: 8,
    background: measureMode ? "#b8860b" : "#eee",
    color: measureMode ? "white" : "black",
  }}
>
  📏 Mesurer distance
</button>

<button
  onClick={() => setDesignMode(!designMode)}
  style={{
    padding: 8,
    marginLeft: 8,
    background: designMode ? "#1565c0" : "#eee",
    color: designMode ? "white" : "black",
  }}
>
  🌿 Conception massif
</button>

<span style={{ marginLeft: 12 }}>
  Zoom : {Math.round(zoom * 100)}%
</span>
</div>

{designMode && (
  <div
    style={{
      padding: 12,
      background: "#e3f2fd",
      borderRadius: 8,
      marginBottom: 16,
    }}
  >
    <select
      value={designPlant}
      onChange={(e) => setDesignPlant(e.target.value)}
      style={{
  padding: "10px 14px",
  borderRadius: 14,
  border: "1px solid rgba(31,77,43,0.12)",
  background: "white",
  color: "#1f4d2b",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 6px 16px rgba(31,77,43,0.08)",
}}
    >
      <option value="">Choisir une plante</option>

      {plantLibrary.map((plant) => (
        <option key={plant.id} value={plant.id}>
          {plant.name}
        </option>
      ))}
    </select>

    <select
  value={selectedDesignZone}
  onChange={(e) => setSelectedDesignZone(e.target.value)}
>
  <option value="">Choisir une zone</option>

  {zones.map((zone) => (
    <option key={zone.name} value={zone.name}>
      {zone.name}
    </option>
  ))}
  
</select>

    {selectedDesignPlant && (
      <div style={{ marginTop: 12 }}>
        <p>
          🌿 <strong>{selectedDesignPlant.name}</strong>
        </p>

        <p>
          📏 Espacement conseillé :
          <strong> {designSpacing} m</strong>
        </p>

        <p>
          🌳 Nombre théorique sur la surface libre :
          <strong> {possiblePlants}</strong>
        </p>

        {selectedZone && (
  <>
    <p>
      🗺️ Zone :
      <strong> {selectedZone.name}</strong>
    </p>

    <p>
      📐 Surface de la zone :
      <strong> {selectedZoneArea.toFixed(1)} m²</strong>
    </p>

    <p>
      🌿 Nombre possible dans cette zone :
      <strong> {possiblePlantsInZone}</strong>
    </p>
  </>
)}
      </div>
    )}
  </div>
)}
      {measureMode && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            border: "1px solid #d6a300",
            borderRadius: 8,
            background: "#fff8dc",
            width: "fit-content",
          }}
        >
          {measurePlants.length === 0 && "Clique sur une première plante."}
          {measurePlants.length === 1 &&
            `Première plante : ${measurePlants[0].name}. Clique sur une deuxième plante.`}
          {measurePlants.length === 2 &&
            `Distance ${measurePlants[0].name} ↔ ${measurePlants[1].name} : ${measuredDistance?.toFixed(
              2
            )} m`}
        </div>
      )}

      <div
  style={{
    display: "grid",
    gridTemplateColumns: "minmax(0,1fr) 400px",
    gap: 24,
    alignItems: "start",
  }}
>
        <div
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
           width: "100%",
            height: 900,
            border: "3px solid #2e7d32",
boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
            borderRadius: 24,
            overflow: "hidden",
            position: "relative",
            userSelect: "none",
            background: "#1a1a1a",
            backdropFilter: "blur(4px)",
            cursor: panMode ? (isPanning ? "grabbing" : "grab") : "default",
          }}
        >
          <div
            style={{
              width: 900,
              height: 1300,
              backgroundColor: "#e8f5e9",
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              position: "absolute",
              left: 0,
              top: 0,
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "top left",
            }}
          >
            {zones.map((zone) => (
              <div
                key={zone.id}
                style={{
                  position: "absolute",
                  left: zone.pos_x,
                  top: zone.pos_y,
                  width: zone.width,
                  height: zone.height,
                  backgroundColor: zone.color,
                  opacity: 0.35,
                  border: "2px solid #666",
                  borderRadius: 8,
                  pointerEvents: "none",
                }}
              >
                <div style={{ padding: 4, fontWeight: "bold", fontSize: 12 }}>
                  {zone.name}
                </div>
              </div>
            ))}

            {measurePlants.length === 2 && (
              <svg
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: 900,
                  height: 1300,
                  pointerEvents: "none",
                  zIndex: 20,
                }}
              >
                <line
                  x1={measurePlants[0].pos_x}
                  y1={measurePlants[0].pos_y}
                  x2={measurePlants[1].pos_x}
                  y2={measurePlants[1].pos_y}
                  stroke="yellow"
                  strokeWidth="4"
                  strokeDasharray="8 6"
                />
              </svg>
            )}

            {plants.map((plant) => {
  const diameterPx =
    (plant.adult_diameter || 0) * PIXELS_PER_METER;

  const isMeasured = measurePlants.some(
    (p) => p.id === plant.id
  );
const logs = allPlantLogs.filter(
  (log) => log.plant_id === plant.id
);

const lastLog = logs[0];

let followDot = "🔴";

if (lastLog) {
  const days = Math.floor(
    (Date.now() - new Date(lastLog.created_at).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (days < 30) {
    followDot = "🟢";
  } else if (days < 90) {
    followDot = "🟠";
  }
}
 

  return (
                <div key={plant.id}>
                  {showAdultSize && plant.adult_diameter > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        left: plant.pos_x,
                        top: plant.pos_y,
                        width: diameterPx,
                        height: diameterPx,
                        transform: "translate(-50%, -50%)",
                        border:
                          plant.id === highlightedPlantId || isMeasured
                            ? "4px solid yellow"
                            : "2px dashed rgba(255,255,255,0.9)",
                        backgroundColor:
                          plant.id === highlightedPlantId || isMeasured
                            ? "rgba(255, 235, 59, 0.25)"
                            : "rgba(46, 125, 50, 0.22)",
                        borderRadius: "50%",
                        zIndex: 5,
                        pointerEvents: "none",
                      }}
                    />
                  )}

                  <div
                    onMouseDown={(event) => {
                      event.stopPropagation();
                      if (panMode) return;

                      if (!measureMode) {
                        setDraggedPlantId(plant.id);
                      }

                      handlePlantClick(plant);
                    }}
                    style={{
                      position: "absolute",
                      left: plant.pos_x,
                      top: plant.pos_y,
                      transform: "translate(-50%, -50%)",
                      cursor: "grab",
                      textAlign: "center",
                      padding: 8,
                      zIndex: 30,
                      color: "white",
                      textShadow: "0 1px 4px black",
                    }}
                    title={plant.name}
                  >
                    <div style={{ fontSize: 32 }}>{getPlantIcon(plant.plant_type)}</div>
<div
  style={{
    fontSize: 12,
    marginTop: -4,
  }}
>
  {followDot}
</div>
                    {showPlantNames && (
                      <div style={{ fontWeight: "bold" }}>{plant.name}</div>
                    )}
                  </div>
                </div>
              );
            })}

            <div
              style={{
                position: "absolute",
                left: 24,
                bottom: 24,
                width: scaleBarPixels,
                borderTop: "5px solid white",
                color: "white",
                fontWeight: "bold",
                textShadow: "0 1px 5px black",
                zIndex: 30,
              }}
            >
              <div style={{ marginTop: 6 }}>10 m</div>
            </div>
          </div>
        </div>

        <div
          style={{
            width: 380,
minHeight: 500,
border: "1px solid rgba(31,77,43,0.10)",
borderRadius: 28,
padding: 24,
background: "rgba(255,255,255,0.92)",
backdropFilter: "blur(10px)",
boxShadow: "0 20px 45px rgba(31,77,43,0.18)",
position: "sticky",
top: 24,
          }}
        >
          {selectedPlant ? (
            <>
              <h2>
  {plantFollowDot} {selectedPlant.name}
</h2>
<div
  style={{
    background: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  }}
>
  <p>
    📷 Photos : <strong>{photoCount}</strong>
  </p>

  <p>
    📝 Observations : <strong>{observationCount}</strong>
  </p>

  <p>
    🕒 Dernière observation :
    <br />
    <strong>
      {lastObservation
        ? new Date(lastObservation).toLocaleDateString("fr-FR")
        : "Aucune"}
    </strong>
  </p>
  <p
  style={{
    color: followColor,
    fontWeight: "bold",
  }}
>
  {followStatus}
</p>
</div>
              <input type="file" accept="image/*" onChange={uploadImage} />

              {selectedPlant.image_url && (
                <img
                  src={selectedPlant.image_url}
                  alt={selectedPlant.name}
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    marginTop: 10,
                    marginBottom: 10,
                  }}
                />
              )}

              <p>
                <em>{selectedPlant.latin_name}</em>
              </p>

              <p>
                Type : <strong>{selectedPlant.plant_type || "Non défini"}</strong>
              </p>

              <p>
                Diamètre adulte :{" "}
                <strong>{selectedPlant.adult_diameter || 0} m</strong>
              </p>
<hr />

<h3>📒 Plantation</h3>
<hr />

<h3>📝 Journal de suivi</h3>
<input
  type="file"
  accept="image/*"
  onChange={(e) =>
    setLogImage(e.target.files?.[0] || null)
  }
  style={{
    marginBottom: 8,
    width: "100%",
  }}
/>

<textarea
  placeholder="Ajouter une observation..."
  value={newLog}
  onChange={(e) => setNewLog(e.target.value)}
  style={{
    width: "100%",
    minHeight: 80,
    marginBottom: 8,
  }}
/>

<button
  onClick={addPlantLog}
  style={{
    width: "100%",
    padding: 8,
    marginBottom: 12,
  }}
>
  ➕ Ajouter une observation
</button>

{plantLogs.map((log) => (
  <div
    key={log.id}
    style={{
      border: "1px solid rgba(31,77,43,0.08)",
       boxShadow: "0 12px 30px rgba(31,77,43,0.08)",
      borderRadius: 8,
      padding: 8,
      marginBottom: 8,
    }}
  >
    <small>
      {new Date(log.created_at).toLocaleDateString("fr-FR")}
    </small>

    <p>{log.note}</p>
    {log.image_url && (
  <img
    src={log.image_url}
    alt=""
    style={{
      width: "100%",
      borderRadius: 8,
      marginTop: 8,
    }}
  />
)}
  </div>
))}
<p>
  Âge :
  <br />
  <strong>{getPlantAge(selectedPlant.planting_date)}</strong>
</p>
<input
  type="date"
  value={selectedPlant.planting_date || ""}
  onChange={async (e) => {
    const value = e.target.value;

    await supabase
      .from("plants")
      .update({ planting_date: value })
      .eq("id", selectedPlant.id);

    setSelectedPlant({
      ...selectedPlant,
      planting_date: value,
    });
  }}
  style={{ width: "100%", padding: 8, marginBottom: 8 }}
/>

<input
  type="number"
  placeholder="Prix d'achat"
  value={selectedPlant.purchase_price || ""}
  onChange={async (e) => {
    const value = Number(e.target.value);

    await supabase
      .from("plants")
      .update({ purchase_price: value })
      .eq("id", selectedPlant.id);

    setSelectedPlant({
      ...selectedPlant,
      purchase_price: value,
    });
  }}
  style={{ width: "100%", padding: 8, marginBottom: 8 }}
/>

<input
  type="text"
  placeholder="Lieu d'achat"
  value={selectedPlant.purchase_place || ""}
  onChange={async (e) => {
    const value = e.target.value;

    await supabase
      .from("plants")
      .update({ purchase_place: value })
      .eq("id", selectedPlant.id);

    setSelectedPlant({
      ...selectedPlant,
      purchase_place: value,
    });
  }}
  style={{ width: "100%", padding: 8, marginBottom: 8 }}
/>

<textarea
  placeholder="Notes"
  value={selectedPlant.notes || ""}
  onChange={async (e) => {
    const value = e.target.value;

    await supabase
      .from("plants")
      .update({ notes: value })
      .eq("id", selectedPlant.id);

    setSelectedPlant({
      ...selectedPlant,
      notes: value,
    });
  }}
  style={{
    width: "100%",
    minHeight: 100,
    padding: 8,
  }}
/>
<p>
  Date de plantation :
  <br />
  <strong>{selectedPlant.planting_date || "Non renseignée"}</strong>
</p>

<p>
  Prix d'achat :
  <br />
  <strong>
    {selectedPlant.purchase_price
      ? `${selectedPlant.purchase_price} €`
      : "Non renseigné"}
  </strong>
</p>

<p>
  Lieu d'achat :
  <br />
  <strong>{selectedPlant.purchase_place || "Non renseigné"}</strong>
</p>

<p>
  Notes :
  <br />
  <strong>{selectedPlant.notes || "Aucune note"}</strong>
</p>
              <hr />

              <h3>Entretien</h3>

              <p>💧 Arrosage :<br /><strong>{selectedPlant.watering}</strong></p>
              <p>✂️ Taille :<br /><strong>{selectedPlant.pruning}</strong></p>
              <p>☀️ Exposition :<br /><strong>{selectedPlant.exposure}</strong></p>
              <p>❄️ Rusticité :<br /><strong>{selectedPlant.hardiness}</strong></p>

              <hr />

              <p>
                Position : X {selectedPlant.pos_x} / Y {selectedPlant.pos_y}
              </p>

              <p>
                Échelle : <strong>1 m ≈ {PIXELS_PER_METER} px</strong>
              </p>

              {measuredDistance !== null && recommendedDistance !== null && (
  <div
    style={{
      marginTop: 12,
      padding: 12,
      borderRadius: 8,
      background: hasConflict ? "#ffe5e5" : "#e8f5e9",
      border: hasConflict ? "1px solid #c62828" : "1px solid #2e7d32",
    }}
  >
    <h3>{hasConflict ? "⚠️ Conflit détecté" : "✅ Espacement correct"}</h3>

    <p>
      Distance mesurée :{" "}
      <strong>{measuredDistance.toFixed(2)} m</strong>
    </p>

    <p>
      Distance recommandée :{" "}
      <strong>{recommendedDistance.toFixed(2)} m</strong>
    </p>

    {hasConflict ? (
      <p>Ces plantes risquent de se gêner à maturité.</p>
    ) : (
      <p>Ces plantes ont assez d’espace pour se développer.</p>
    )}
  </div>
)}
            </>
          ) : (
            <p>Clique sur une plante pour afficher sa fiche.</p>
          )}
        </div>
      </div>
      </main>
    </div>
  );
}

export default App;