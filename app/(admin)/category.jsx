import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

<<<<<<< HEAD
export default function category() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Category Page</Text>
    </View>
  )
=======
export default function Category() {
    const db = firestore().collection("category");

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [category, setCategory] = useState([]);
    const [addInput, setAddInput] = useState("");
    const [editInput, setEditInput] = useState("");
    const [editId, setEditId] = useState(null);

    // ฟังก์ชันดึงข้อมูลหมวดหมู่จาก Firestore
    const getCategoryData = (querySnapShot) => {
        const Arr = [];
        querySnapShot.forEach((res) => {
            const { name, status } = res.data();
            Arr.push({
                id: res.id,
                name,
                status,
            });
        });

        setCategory(Arr);
    };

    // ฟังก์ชันเพิ่มหมวดหมู่ใหม่
    const addCategory = () => {
        if (addInput !== "") {
            db.add({
                name: addInput,
                status: true,
            });

            setAddInput("");
            setShowAddModal(false);
        }
    };

    // ฟังก์ชันเปิด modal แก้ไขหมวดหมู่
    const openEditModal = (id, name) => {
        setEditInput(name);
        setEditId(id);
        setShowEditModal(true);
    };

    // ฟังก์ชันบันทึกการแก้ไขหมวดหมู่
    const submitEdit = () => {
        db.doc(editId).update({
            name: editInput,
        });

        setShowEditModal(false);
    };

    // ฟังก์ชันเปิดใช้งานหมวดหมู่ที่ถูกปิดใช้งาน
    const enableCategory = (id, name) => {
        Alert.alert("เปิดใช้งานหมวดหมู่กิจกรรม", "ยืนยันเปิดใช้งานหมวดหมู่" + name, [
            {
                text: "ยกเลิก",
            },
            {
                text: "ยืนยัน",
                onPress: () =>
                    db.doc(id).update({
                        status: true,
                    }),
            },
        ]);
    }

    // ฟังก์ชันยกเลิกใช้งานหมวดหมู่
    const cancelCategory = (id, name) => {
        Alert.alert("", "ยืนยันยกเลิกใช้งานหมวดหมู่" + name, [
            {
                text: "ยกเลิก",
            },
            {
                text: "ยืนยัน",
                onPress: () =>
                    db.doc(id).update({
                        status: false,
                    }),
            },
        ]);
    };

    // ดึงข้อมูลหมวดหมู่จาก Firestore ทุกครั้งที่มีการเปลี่ยนแปลง
    useEffect(() => {
        db.onSnapshot(getCategoryData);
    }, []);

    return (
        <SafeAreaView style={styles.container}>
             {/* ปุ่มเพิ่มหมวดหมู่กิจกรรม */}
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowAddModal(true)}
                style={styles.addButton}
            >
                <Text style={styles.addButtonText}>
                    เพิ่มหมวดหมู่กิจกรรม
                </Text>
            </TouchableOpacity>

            {/* แสดงรายการหมวดหมู่ทั้งหมด */}
            <FlatList
                data={category}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 3}}
                renderItem={({ item }) => (
                    <View style={styles.listContainer}>
                        <View style={styles.listContent}>
                            <View style={{ width: "75%" }}>
                                <Text style={styles.name}>
                                    {item.name}
                                </Text>
                            </View>
                            <View style={styles.buttonContainer}>
                                
                                {/* ปุ่มแก้ไข */}
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() =>
                                        openEditModal(item.id, item.name)
                                    }
                                    style={[styles.manageBtn, { backgroundColor: "#FFC300" }]}
                                >
                                    <Text style={[styles.manageBtnText, { color: "black" }]}>แก้ไข</Text>
                                </TouchableOpacity>

                                {/* ปุ่มเปิด/ปิดใช้งาน */}
                                {item.status ? (
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() =>
                                            cancelCategory(item.id, item.name)
                                        }
                                        style={[styles.manageBtn, { backgroundColor: "#FF6200" }]}
                                    >
                                        <Text style={styles.manageBtnText}>
                                            ยกเลิก
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() =>
                                            enableCategory(item.id, item.name)
                                        }
                                        style={[styles.manageBtn, { backgroundColor: "#0095FF" }]}
                                    >
                                        <Text style={styles.manageBtnText}>
                                            เปิดใช้งาน
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                )}
            />

            {/* Modal เพิ่มหมวดหมู่กิจกรรม */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showAddModal}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    setShowAddModal(!showAddModal);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>
                            เพิ่มหมวดหมู่กิจกรรม
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setShowAddModal(false)}
                            style={styles.modalCloseIcon}
                        >
                            <MaterialIcons
                                name="close"
                                size={24}
                                color="black"
                            />
                        </TouchableOpacity>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="category" size={24} color="#373F78" />
                            <TextInput
                                style={styles.input}
                                placeholder="ชื่อหมวดหมู่"
                                placeholderTextColor="#373F78"
                                value={addInput}
                                onChangeText={setAddInput}
                            />
                        </View>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={addCategory}
                                style={styles.modalBtn}
                            >
                                <Text style={styles.modalBtnText}>
                                    ยืนยัน
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal แก้ไขหมวดหมู่กิจกรรม */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showEditModal}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    setShowEditModal(!showEditModal);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>
                            แก้ไขหมวดหมู่กิจกรรม
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setShowEditModal(false)}
                            style={styles.modalCloseIcon}
                        >
                            <MaterialIcons name="close" size={24} color="black" />
                        </TouchableOpacity>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="category" size={24} color="#373F78" />
                            <TextInput
                                style={styles.input}
                                placeholder="ชื่อหมวดหมู่"
                                placeholderTextColor="#373F78"
                                value={editInput}
                                onChangeText={setEditInput}
                            />
                        </View>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={submitEdit}
                                style={styles.modalBtn}
                            >
                                <Text style={styles.modalBtnText}>
                                    ยืนยัน
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
>>>>>>> develop
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center"
    },
    text: {
        fontFamily: "Kanit_600SemiBold"
    }
})