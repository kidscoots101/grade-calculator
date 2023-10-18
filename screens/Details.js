import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TextInput, Button } from "react-native-paper";

const Details = ({ route }) => {
  const { subject, paperData } = route.params;

  const [paperValues, setPaperValues] = useState({});
  const [helpText, setHelpText] = useState("");

  const handleTextInputChange = (paperKey, value) => {
    setPaperValues({ ...paperValues, [paperKey]: value });
    setHelpText(""); // Clear the error message when the user inputs new values.
  };

  const renderPaperInputs = () => {
    return paperData.map((paper, index) => (
      <View key={paper.key} style={styles.paperContainer}>
        <Text style={styles.paperTitle}>Paper {paper.number}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            label="Marks"
            value={paperValues[paper.key] || ""}
            onChangeText={(text) => handleTextInputChange(paper.key, text)}
            keyboardType="numeric"
            style={styles.input}
          />
          <Text style={styles.maxMarkText}>/ {paper.maxMark}</Text>
        </View>
        <Text style={styles.paperInfo}>
          Percentage: {calculatePercentage(paper.key)}
        </Text>
      </View>
    ));
  };

  const calculatePercentage = (paperKey) => {
    const paperValue = parseFloat(paperValues[paperKey] || 0);
    const maxMark = parseFloat(
      paperData.find((paper) => paper.key === paperKey).maxMark,
    );

    if (isNaN(paperValue) || isNaN(maxMark) || maxMark <= 0) {
      setHelpText("Please provide valid marks and max mark for all papers.");
      return "N/A";
    }

    if (paperValue > maxMark) {
      setHelpText("Marks cannot exceed Max Mark.");
      return "N/A";
    }

    const percentage = ((paperValue / maxMark) * 100).toFixed(2) + "%";
    return percentage;
  };

  const [grade, setGrade] = useState(0);
  const [score, setScore] = useState("");

  const calculateOverallGrade = () => {
    if (helpText) return "N/A";

    const totalPercentage = paperData.reduce((acc, paper) => {
      const paperValue = parseFloat(paperValues[paper.key] || 0);
      const maxMark = parseFloat(paper.maxMark);
      if (isNaN(paperValue) || isNaN(maxMark) || maxMark <= 0) {
        setHelpText("Please provide valid marks and max mark for all papers.");
        return acc;
      }
      if (paperValue > maxMark) {
        setHelpText("Marks cannot exceed Max Mark.");
        return acc;
      }
      return acc + (paperValue / maxMark) * paper.percentage;
    }, 0);

    setGrade(totalPercentage.toFixed(2));
    if (grade >= 75 && grade <= 100) {
      setScore("A1");
    } else if (grade < 75 && grade >= 70) {
      setScore("A2");
    } else if (grade < 70 && grade >= 65) {
      setScore("B3");
    } else if (grade < 65 && grade >= 60) {
      setScore("B4");
    } else if (grade < 60 && grade >= 55) {
      setScore("C5");
    } else if (grade < 55 && grade >= 50) {
      setScore("C6");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{subject}</Text>
      {renderPaperInputs()}
      <Text style={styles.helpText}>{helpText}</Text>
      <Button
        icon="calculator"
        mode="contained"
        onPress={() => calculateOverallGrade()}
      >
        Calculate
      </Button>
      <Text style={styles.overallGradeText}>Percentage score {grade}%</Text>
      <Text style={styles.overallGradeText}>Score: {score}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 20,
  },
  header: {
    fontWeight: "bold",
    fontSize: 30,
    marginBottom: 20,
  },
  paperContainer: {
    marginBottom: 10,
  },
  paperTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  paperInfo: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    marginRight: 10,
  },
  maxMarkText: {
    fontSize: 16,
  },
  overallGradeText: {
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 20,
  },
  helpText: {
    color: "red",
    fontSize: 16,
    marginBottom: 10,
  },
});

export default Details;
