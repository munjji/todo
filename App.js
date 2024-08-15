import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./colors";
import { useEffect, useState } from "react";

const STORAGE_KEY = "@toDos";
const HEADER = "header";

export default function App() {
  const [working, setWorking] = useState(true); // 초기값은 false
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});

  const travel = async () => {
    setWorking(false);
    await saveHeader(false);
  };

  const work = async () => {
    setWorking(true);
    await saveHeader(true);
  };

  const onChangeEvent = (payload) => {
    setText(payload);
  };

  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };

  const saveHeader = async (working) => {
    await AsyncStorage.setItem(HEADER, working.toString());
  };

  const loadToDos = async () => {
    try {
      const jsonPayload = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonPayload) {
        setToDos(JSON.parse(jsonPayload));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getHeader = async () => {
    try {
      const storageWorking = await AsyncStorage.getItem(HEADER);
      setWorking(storageWorking === "true"); // 문자열 "true"와 비교
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getHeader(); // AsyncStorage에서 header 값을 가져옴
    loadToDos(); // ToDo 목록을 불러옴
  }, []);

  const addToDo = async () => {
    if (text === "") return;
    const newToDos = { ...toDos, [Date.now()]: { text, working } };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  const deleteToDo = (key) => {
    Alert.alert("Delete To Do?", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm sure",
        style: "destructive",
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{ ...styles.btnText, color: working ? theme.grey : "white" }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          onSubmitEditing={addToDo}
          onChangeText={onChangeEvent}
          value={text}
          returnKeyType="done"
          placeholder={working ? "Add a To Do" : "Where do you want to go?"}
          style={styles.input}
        />
      </View>
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View key={key} style={styles.todo}>
              <Text style={styles.todoText}>{toDos[key].text}</Text>
              <TouchableOpacity onPress={() => deleteToDo(key)}>
                <Text>❌</Text>
              </TouchableOpacity>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    marginTop: 100,
    flexDirection: "row",
  },
  btnText: {
    fontSize: 60,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  todo: {
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  todoText: {
    color: "white",
    fontSize: 20,
    fontWeight: "500",
  },
});
