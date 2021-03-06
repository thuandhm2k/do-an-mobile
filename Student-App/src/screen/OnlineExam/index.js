import React, { useState, Component, useEffect, useContext }from 'react'
import { KeyboardAvoidingView, View, Text, StyleSheet, TextInput, Button, TouchableOpacity, SafeAreaView,ScrollView,Modal, Alert, Pressable, RefreshControl} from 'react-native';
import CalendarStrip from 'react-native-slideable-calendar-strip';
import { passwordValidator, retypePassValidator } from '../../helpers/passwordValidator';
import { usernameValidator } from '../../helpers/usernameValidator'
import { RadioButton, Card, Avatar, IconButton } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Ionicons';
import TokenContext from '../../Context/TokenContext';
import {addDays, format, getDate, isSameDay, startOfWeek, parseJSON, isAfter, isBefore} from 'date-fns';
import { enGB, eo, ru, vi } from 'date-fns/locale';

export default function OnlineExam({navigation}){
    const token = useContext(TokenContext);
    const [examList, setExamList] = useState([]);
    const [answerList, setAnswerList] = useState([]);
    const [TimeChecker, setTimeChecker] = useState([]);
    // const [index, setIndex] = useState([]);
    const getExam = async () => {
        await fetch('http://quocha.xyz/api/exam/student', {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization:'Bearer '+token,
        },
        })
        .then(res => res.json())
        .then(res => {
            setExamList(res.data);
            let TimeCheckers = [];
            res.data.forEach(item => {
                TimeCheckers = TimeCheckers.concat(isAfter(new Date(),parseJSON(item.start_at)) && isBefore(new Date(),parseJSON(item.expire_at)));
            });
            setTimeChecker(TimeCheckers);
            // setIndex(Array(res.data.length).fill(-1));
        });
        };
    const getAnswer = async () => {
        await fetch('http://quocha.xyz/api/answer/student', {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization:'Bearer '+token,
        },
        })
        .then(res => res.json())
        .then(res => {
            setAnswerList(res.data);
        }).then(getExam);
    };
    const reload = async () =>{
        let indexs = [...index];
            for( let i =0 ; i < answerList.length; i++){
                console.log(answerList[i].exam_id);
                indexs[examList.findIndex(x => x.id === answerList[i].exam_id)] = i;
            }
            // for( const item of examList){
            //     indexs = indexs.concat(answerList.findIndex(x => x.exam_id === item));
            //     console.log(indexs);   
            // };
        setIndex(indexs) ;
    };  
    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", async () => {
            await  getAnswer(), getExam();
            console.log(answerList); 
        });
        // reload();
        return () => {unsubscribe; setExamList();}
    }, [navigation]);
    
    // const index = reload();

    // useEffect(async () => {
    //     await setTimeout(async () => {
    //     await reload();}, 100);
    // });
    // console.log(answerList.findIndex()); 
    const [modalVisible, setModalVisible] = useState(false);
    const [examID,setExamID]=useState([]);
    let index=[];
    function checkExam(item = {item}){
        index = index.concat(answerList.findIndex(x => x.exam_id === item));
        // console.log(item ,index);
        return index
    };
    // let TimeChecker = [];
    // async function checkTime(){
    //     examList.forEach(item => {
    //         TimeChecker = TimeChecker.concat(isAfter(new Date(),parseJSON(item.start_at)) && isBefore(new Date(),parseJSON(item.expire_at)));
    //     });
    //     return TimeChecker
    // };
    // checkTime();
    
    console.log(index);
    return (
      <SafeAreaView style={styles.Container}>
           <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Pressable
                                    style={[styles.closebutton]}
                                    onPress={() => {setModalVisible(!modalVisible)}}>
                                    <Icon name="md-close" size={23} color='#BFBFBF' />
                            </Pressable>
                            <Text style={[styles.TitleText, {marginBottom:15}]}>{examID.name}</Text>
                            <Text style={[styles.ContentText,{textAlign:'center'}]}>B???n c?? {examID.time} ph??t ????? th???c hi???n b??i l??m</Text>
                            <Text style={[styles.ContentText,{textAlign:'center'}]}>Th???i gian s??? ???????c t??nh sau khi b???m "B???t ?????u"</Text>
                            <Text style={[styles.ContentText,{textAlign:'center',marginBottom:15}]}>B???n ???? s???n s??ng !</Text>
                            <Pressable
                                    style={[styles.button, {backgroundColor:'green'}]}
                                    onPress={() => {
                                            navigation.navigate('MainExam', {data1: examID, anw: false}); setModalVisible(!modalVisible)}}>
                                    <Text style={styles.textStyle}>B???t ?????u</Text>
                            </Pressable>
                        </View>
                    </View>
            </Modal>
            { examList.length != 0 ?
            (<ScrollView style={styles.NotiView}>
                {/* <Text>{token}</Text> */}
                {examList.map((item, i)=>(
                    // <Pressable   onPress={() => {
                    //     setExamID(item);
                    //     setModalVisible(!modalVisible);
                    // }}>
                    <View key={i} style={styles.NotiText}> 
                        <Text style={styles.TitleText}>{item.name} </Text>
                        <Text style={styles.ContentText}>Th???i gian: {format(parseJSON(item.start_at),'p  P', {locale: vi})} -- {format(parseJSON(item.expire_at),'p  P', {locale: vi})} </Text>
                        <Text style={styles.ContentText}>Th???i gian l??m b??i: {item.time} ph??t</Text>
                        { checkExam(item.id)[i] == -1 ? (
                            <View>
                                <Text style={styles.ContentText}>Ch??a n???p b??i</Text>
                                { TimeChecker[i] ? (
                                    <Pressable  style={[styles.button, {backgroundColor:'green', marginTop:10, flexDirection:'row', alignItems: 'center', width:'24%'}]} onPress={() => {
                                        setExamID(item);
                                        setModalVisible(!modalVisible);}}>
                                            <Icon name="ios-logo-electron" color={'#FEFEFE'} size={20} />
                                            <Text style={[styles.textStyle, {marginLeft: 10}]}>L??m b??i</Text>
                                    </Pressable>
                                ) : (
                                    <Pressable  style={[styles.button, {backgroundColor:'grey', marginTop:10, flexDirection:'row', alignItems: 'center', width:'24%'}]} disabled={true} onPress={() => {
                                        setExamID(item);
                                        setModalVisible(!modalVisible);}}>
                                            <Icon name="ios-logo-electron" color={'#FEFEFE'} size={20} />
                                            <Text style={[styles.textStyle, {marginLeft: 10}]}>L??m b??i</Text>
                                    </Pressable>
                                )}
                                {/* <Pressable  style={[styles.button, {backgroundColor:'green', marginTop:10, flexDirection:'row', alignItems: 'center', width:'24%'}]} onPress={() => {
                                    setExamID(item);
                                    setModalVisible(!modalVisible);}}>
                                        <Icon name="ios-logo-electron" color={'#FEFEFE'} size={20} />
                                        <Text style={[styles.textStyle, {marginLeft: 10}]}>L??m b??i</Text>
                                </Pressable> */}
                            </View>
                            ) : (
                            <View>
                                <Text style={styles.ContentText}>N???p b??i l??c: {format(parseJSON(answerList[index.key = index[i]].createdAt),'p  P', {locale: vi})}</Text>
                                <Text style={styles.ContentText}>??i???m: {answerList[index.key = index[i]].score}</Text>
                                <Pressable  style={[styles.button, {backgroundColor:'#3891E9', marginTop:10, flexDirection:'row', alignItems: 'center', width:'32%'}]} onPress={() => {navigation.navigate('MainExam', {data1: item, anw: answerList[index.key = index[i]]})
                                    }}>
                                        <Icon name="ios-logo-electron" color={'#FEFEFE'} size={20} />
                                        <Text style={[styles.textStyle, {marginLeft: 10}]}>Xem l???i b??i l??m</Text>
                                </Pressable>
                            </View>)} 
                    </View> 
                    //</Pressable>
                ))}
                
            </ScrollView>):(<Text style={{textAlign:'center', marginTop: 15}}>KH??NG C?? D??? LI???U</Text>)
            }
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 5,
        alignItems: 'center'
    },
    headerText: {
        position: "relative",
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FEFEFE',
    },
    headerView: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: '2.5%',
        backgroundColor: '#4B75F2',
    },
    NotiView:{
        position: 'relative',
        marginVertical: '2%',
    },
    NotiText:{
        marginHorizontal: '2.5%',
        // borderWidth: .5,
        borderRadius: 10,
        padding: 10,
        marginVertical: '.5%',
        // borderColor:'#BFBFBF',
        backgroundColor: '#FEFEFE',
    },
    TitleText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    ContentText: {
        fontSize: 14,
        color:'black',
    },
    Notification_date:{
        fontSize: 10,
        color: '#262626',
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        // marginTop: 22
    },
    modalView: {
        // margin: 20,
        backgroundColor: "white",
        borderRadius: 15,
        padding: 15,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '75%',
        paddingBottom: 38,
    },
    button: {
	    margin:2,
        borderRadius: 5,
        // borderWidth: 0.5,
        padding: 10,
        // backgroundColor:'green',
    },
    closebutton: {
	    alignSelf: 'flex-end',
    },
    textStyle: {
        color: '#FEFEFE'
    }
});


