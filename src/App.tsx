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
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [draggedPlantId, setDraggedPlantId] = useState<number | null>(null);
  const [showPlantNames, setShowPlantNames] = useState(false);

  const [newName, setNewName] = useState("");
  const [newLatinName, setNewLatinName] = useState("");

  const backgroundImage =
    "https://mhtacyaqhztbgtyikpnc.supabase.co/storage/v1/object/public/garden-images/terrain%202.png";

  const PIXELS_PER_METER = 14.72;
  const scaleBarMeters = 10;
  const scaleBarPixels = scaleBarMeters * PIXELS_PER_METER;

  useEffect(() => {
    getPlants();
    getZones();
  }, []);

  async function getPlants() {
    const { data, error } = await supabase.from("plants").select("*");
    if (error) return console.error(error);
    setPlants(data || []);
  }

  async function getZones() {
    const { data, error } = await supabase.from("zones").select("*");
    if (error) return console.error(error);
    setZones(data || []);
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
      })
      .select()
      .single();

    if (error) return console.error(error);

    setPlants((current) => [...current, data]);
    setSelectedPlant(data);
    setNewName("");
    setNewLatinName("");
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

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (draggedPlantId === null) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.round(event.clientX - rect.left);
    const y = Math.round(event.clientY - rect.top);

    setPlants((currentPlants) =>
      currentPlants.map((plant) =>
        plant.id === draggedPlantId ? { ...plant, pos_x: x, pos_y: y } : plant
      )
    );

    setSelectedPlant((current) =>
      current?.id === draggedPlantId
        ? { ...current, pos_x: x, pos_y: y }
        : current
    );
  }

  async function handleMouseUp() {
    if (draggedPlantId === null) return;

    const plant = plants.find((p) => p.id === draggedPlantId);

    if (plant) {
      await updatePlantPosition(plant.id, plant.pos_x, plant.pos_y);
    }

    setDraggedPlantId(null);
  }

  async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    if (!selectedPlant) return;

    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = `${selectedPlant.id}-${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("plants")
      .upload(fileName, file);

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
        plant.id === selectedPlant.id
          ? { ...plant, image_url: publicUrl }
          : plant
      )
    );

    setSelectedPlant({
      ...selectedPlant,
      image_url: publicUrl,
    });
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>JardiVue 🌿</h1>

      <div style={{ marginBottom: 16 }}>
        <input
          placeholder="Nom de la plante"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={{ padding: 8, marginRight: 8 }}
        />

        <input
          placeholder="Nom latin"
          value={newLatinName}
          onChange={(e) => setNewLatinName(e.target.value)}
          style={{ padding: 8, marginRight: 8 }}
        />

        <button onClick={addPlant} style={{ padding: 8, marginRight: 8 }}>
          ➕ Ajouter une plante
        </button>

        <button
          onClick={() => setShowPlantNames(!showPlantNames)}
          style={{ padding: 8 }}
        >
          {showPlantNames ? "Masquer les noms" : "Afficher les noms"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <div
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            width: 900,
            height: 1300,
            border: "2px solid #2f5d3a",
            backgroundColor: "#e8f5e9",
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            position: "relative",
            borderRadius: 12,
            overflow: "hidden",
            userSelect: "none",
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
              <div
                style={{
                  padding: 4,
                  fontWeight: "bold",
                  fontSize: 12,
                }}
              >
                {zone.name}
              </div>
            </div>
          ))}

          {plants.map((plant) => (
            <div
              key={plant.id}
              onMouseDown={() => {
                setDraggedPlantId(plant.id);
                setSelectedPlant(plant);
              }}
              style={{
                position: "absolute",
                left: plant.pos_x,
                top: plant.pos_y,
                transform: "translate(-50%, -50%)",
                cursor: "grab",
                textAlign: "center",
                padding: 8,
                zIndex: 10,
                color: "white",
                textShadow: "0 1px 4px black",
              }}
              title={plant.name}
            >
              <div style={{ fontSize: 32 }}>
                {getPlantIcon(plant.plant_type)}
              </div>

              {showPlantNames && (
                <div style={{ fontWeight: "bold" }}>{plant.name}</div>
              )}
            </div>
          ))}

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

        <div
          style={{
            width: 320,
            minHeight: 500,
            border: "1px solid #ccc",
            borderRadius: 12,
            padding: 20,
            background: "#fff",
            position: "sticky",
            top: 20,
          }}
        >
          {selectedPlant ? (
            <>
              <h2>{selectedPlant.name}</h2>

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

              <hr />

              <h3>Entretien</h3>

              <p>
                💧 Arrosage :
                <br />
                <strong>{selectedPlant.watering}</strong>
              </p>

              <p>
                ✂️ Taille :
                <br />
                <strong>{selectedPlant.pruning}</strong>
              </p>

              <p>
                ☀️ Exposition :
                <br />
                <strong>{selectedPlant.exposure}</strong>
              </p>

              <p>
                ❄️ Rusticité :
                <br />
                <strong>{selectedPlant.hardiness}</strong>
              </p>

              <hr />

              <p>
                Position : X {selectedPlant.pos_x} / Y {selectedPlant.pos_y}
              </p>

              <p>
                Échelle : <strong>1 m ≈ {PIXELS_PER_METER} px</strong>
              </p>
            </>
          ) : (
            <p>Clique sur une plante pour afficher sa fiche.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;