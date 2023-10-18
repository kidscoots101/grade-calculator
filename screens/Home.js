import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { List } from "react-native-paper";
import { FAB } from "react-native-paper";
import { TextInput } from "react-native-paper";
import { SegmentedButtons } from "react-native-paper";
import { FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Swipeable } from "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useScore } from "./ScoreContext";

const PaperNumber = ({ number, onPaperDataChange }) => {
  const [percentage, setPercentage] = useState(0);
  const [maxMark, setMaxMark] = useState(0);

  const handlePercentageChange = (value) => {
    setPercentage(value);
    onPaperDataChange(number, "percentage", value);
  };

  const handleMaxMarkChange = (value) => {
    setMaxMark(value);
    onPaperDataChange(number, "maxMark", value);
  };

  return (
    <View style={{ marginTop: 30 }}>
      <Text>Paper {number}</Text>
      <TextInput
        style={{ marginTop: 10, width: "100%" }}
        mode="outlined"
        label="Percentage (%)"
        placeholder="Enter Percentage"
        value={percentage.toString()}
        onChangeText={handlePercentageChange}
        keyboardType="numeric"
      />
      <TextInput
        style={{ marginTop: 10, width: "100%" }}
        mode="outlined"
        label="Full Mark"
        placeholder="Enter Max Mark"
        value={maxMark.toString()}
        onChangeText={handleMaxMarkChange}
        keyboardType="numeric"
      />
    </View>
  );
};

const Home = ({ route }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [subject, setSubject] = useState("");
  const [papers, setPapers] = useState(2);
  const [subjectList, setSubjectList] = useState([]);
  const [paperData, setPaperData] = useState([]);
  const navigation = useNavigation();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const { score } = useScore();

  const handlePaperDataChange = (paperNumber, field, value) => {
    const updatedPaperData = [...paperData];
    const paperIndex = paperNumber - 1;

    if (!updatedPaperData[paperIndex]) {
      updatedPaperData[paperIndex] = {
        number: paperNumber,
        key: Math.random(),
      };
    }

    updatedPaperData[paperIndex][field] = value;

    setPaperData(updatedPaperData);
  };

  const handleListItemPress = (subject) => {
    setSelectedSubject(subject);
    navigation.navigate("Details", { subject, paperData });
  };
  const paperNumbers = Array.from({ length: papers }, (_, index) => index + 1);
  useEffect(() => {
    loadSubjectList();
  }, []);

  const loadSubjectList = async () => {
    try {
      const storedSubjectList = await AsyncStorage.getItem("subjectList");
      if (storedSubjectList) {
        setSubjectList(JSON.parse(storedSubjectList));
      }
    } catch (error) {
      console.error("Error loading subject list from local storage:", error);
    }
  };
  const saveSubjectList = async (list) => {
    try {
      await AsyncStorage.setItem("subjectList", JSON.stringify(list));
    } catch (error) {
      console.error("Error saving subject list to local storage:", error);
    }
  };
  const handleSave = () => {
    const newSubjectData = {
      subject,
      paperData: paperData.map((paper) => ({
        ...paper,
        subject: subject,
      })),
    };
    saveSubjectList([...subjectList, newSubjectData.subject]);
    setSubjectList((prevSubjectList) => [...prevSubjectList, subject]);
    setSubject("");
    setModalVisible(false);
    // console.log(newSubjectData);
  };
  const handleDeleteSubject = async (subjectName) => {
    try {
      const updatedSubjectList = subjectList.filter(
        (subject) => subject !== subjectName,
      );
      await AsyncStorage.setItem(
        "subjectList",
        JSON.stringify(updatedSubjectList),
      );
      setSubjectList(updatedSubjectList);
    } catch (error) {
      console.error("Error deleting subject from local storage:", error);
    }
  };
  const renderSubjectListItem = (subject) => {
    const swipeRightAction = (progress, dragX) => {
      const trans = dragX.interpolate({
        inputRange: [0, 50, 100],
        outputRange: [0, 0, 1],
      });
      return (
        <View style={styles.deleteAction}>
          <Text style={styles.deleteText}>Delete</Text>
        </View>
      );
    };

    return (
      <Swipeable
        renderRightActions={swipeRightAction}
        onSwipeableRightWillOpen={() => handleDeleteSubject(subject)}
      >
        <List.Item
          style={{
            backgroundColor: "white",
            borderRadius: 10,
          }}
          titleStyle={{ fontWeight: "bold" }}
          title={subject}
          onPress={() => handleListItemPress(subject)}
          right={() => <Text>{score}</Text>}
        />
      </Swipeable>
    );
  };
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, marginTop: 50 }}>
        <List.Section title="Grades">
          <List.Accordion
            title="2023 EOY"
            left={(props) => <List.Icon {...props} icon="book" />}
          >
            <FlatList
              data={subjectList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => renderSubjectListItem(item)}
            />
          </List.Accordion>
        </List.Section>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.modalView}>
            <View
              style={{
                flexDirection: "row",
                position: "absolute",
                alignSelf: "center",
                marginTop: 30,
              }}
            >
              <Pressable
                style={[styles.button, styles.buttonCancel]}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </Pressable>
              <View style={{ flex: 1 }}></View>
              <Pressable
                style={[styles.button, styles.buttonSave]}
                onPress={handleSave}
              >
                <Text style={styles.textStyle}>Save</Text>
              </Pressable>
            </View>

            <View style={{ width: "100%", marginTop: 30 }}>
              <TextInput
                style={{ marginTop: 20 }}
                mode="outlined"
                label="Subject"
                placeholder="Enter Subject"
                value={subject}
                onChangeText={(text) => setSubject(text)}
              />
              <Text style={{ marginTop: 10 }}>Number of Papers</Text>
              <SegmentedButtons
                value={papers}
                onValueChange={setPapers}
                style={{ marginTop: 10 }}
                buttons={[
                  {
                    value: 2,
                    label: "2",
                  },
                  { value: 3, label: "3" },
                  { value: 4, label: "4" },
                ]}
              />
              <ScrollView
                style={{ maxHeight: "60%" }}
                showsVerticalScrollIndicator={false}
              >
                {paperNumbers.map((item) => (
                  <PaperNumber
                    key={item}
                    number={item}
                    onPaperDataChange={handlePaperDataChange}
                  />
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        />
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 50,
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "left",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "100%",
    height: "70%",
    position: "absolute",
    bottom: 0,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    width: "30%",
  },
  buttonCancel: {
    backgroundColor: "#FF6969",
  },
  buttonSave: {
    backgroundColor: "#219C90",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  deleteAction: {
    backgroundColor: "#FF6969",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    borderRadius: 10,
  },
  deleteText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default Home;
