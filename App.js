import { StatusBar } from "expo-status-bar";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Fontisto from "@expo/vector-icons/Fontisto";
import { useEffect, useState } from "react";
import { styles } from "./styles";

const STORAGE_KEY = "@toDos";
const HEADER = "header";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [editingKey, setEditingKey] = useState(null); // 수정할 항목의 키

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
      setWorking(storageWorking === "true");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getHeader();
    loadToDos();
  }, []);

  const addToDo = async () => {
    if (text === "") return;
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, finish: false },
    };
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

  // todo 완료 기능
  const finishToDO = async (key) => {
    const updatedTodo = {
      ...toDos[key],
      finish: !toDos[key].finish,
    };

    const newTodos = {
      ...toDos,
      [key]: updatedTodo,
    };

    setToDos(newTodos);
    saveToDos(newTodos);
  };

  const startEditing = (key) => {
    setEditingKey(key);
    setText(toDos[key].text); // 수정할 항목의 텍스트로 상태 업데이트
  };

  // todo 수정 기능
  const saveCorrection = async (key) => {
    const updatedTodo = {
      ...toDos[key],
      text: text,
    };

    const newTodos = {
      ...toDos,
      [key]: updatedTodo,
    };

    setToDos(newTodos);
    await saveToDos(newTodos);
    setEditingKey(null); // 수정 모드 종료
    setText(""); // 입력 필드 초기화
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
              {editingKey === key ? (
                <>
                  <TextInput
                    value={text}
                    onChangeText={onChangeEvent}
                    style={styles.corrInput}
                    onSubmitEditing={() => saveCorrection(key)}
                    returnKeyType="done"
                    placeholder="correct a todo"
                  />
                  <TouchableOpacity onPress={() => saveCorrection(key)}>
                    <Text style={{ color: "white" }}>save</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text
                    style={{
                      ...styles.todoText,
                      textDecorationLine: toDos[key].finish
                        ? "line-through"
                        : "none",
                    }}
                  >
                    {toDos[key].text}
                  </Text>
                  <View style={styles.icons}>
                    <TouchableOpacity onPress={() => startEditing(key)}>
                      <FontAwesome
                        name="pencil-square-o"
                        size={24}
                        color="white"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => finishToDO(key)}>
                      <Text>
                        {toDos[key].finish ? (
                          <Fontisto
                            name="checkbox-active"
                            size={20}
                            color="white"
                          />
                        ) : (
                          <Fontisto
                            name="checkbox-passive"
                            size={20}
                            color="white"
                          />
                        )}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteToDo(key)}>
                      <Fontisto name="trash" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}
