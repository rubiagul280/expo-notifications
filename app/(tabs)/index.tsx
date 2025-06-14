import { StyleSheet, TextInput, TouchableOpacity} from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import * as Clipboard from 'expo-clipboard';
import { usePushNotifications } from '@/utils/use-push-notifications';

export default function TabOneScreen() {
  const { expoPushToken } = usePushNotifications();

   const handleCopyToken = async () => {
    if (expoPushToken?.data) {
      await Clipboard.setStringAsync(expoPushToken.data);
      alert('Token copied to clipboard');
    } else {
      alert('No token to copy');
    }
  }; 
  return (
    <View style={styles.container}>

      <Text style={styles.heading}>Notification Token</Text>
        <TextInput value={expoPushToken?.data || ''}
          placeholder="Notification Token"
          style={styles.input}
          editable={false}
          selectTextOnFocus={true} />

        <TouchableOpacity activeOpacity={0.8} style={styles.buttonContainer} onPress={handleCopyToken}>
          <Text>Copy Token</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  input: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#030303',
    padding: 15,
  },
  buttonContainer: {
    width: '100%',
    height: 50,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0FBFBD',
    borderRadius: 10,
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
});
