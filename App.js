import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';

// const API_URL = 'http://localhost:3000/items'; // Criar uma url para indicar onde está puxando o json
const API_URL = 'http://127.0.0.1:3000/items'; // Criar uma url para indicar onde está puxando o json

export default function App() {
  const [items, setItems] = useState([]); // lista de itens
  const [text, setText] = useState('');   // texto do input
  const [editId, setEditId] = useState(null); // id em edição
  const [loading, setLoading] = useState(true); // para indicar se o serviço está carregando ou não

  useEffect(() => {  // Carregar todos os items que estão no json
    fetchItems();  // Receber e enviar modo async - Carregar a página 
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);  // 
      const response = await fetch(API_URL); // fetch = esperar pela API_URL e armazenar na response, como resposta vai receber o db.json
      const data = await response.json();
      setItems(data);
    }
    catch (error) {
      console.error('Erro ao buscar itens: ', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    }
    finally {
      setLoading(false);
    }
  }

  const handleAdd = async () => {
    if (!text.trim()) return Alert.alert('Digite algo');  // tirar todos os espaços e pedir o usuário para digitar algo

    try {
      if (editId) {
        await fetch(`${API_URL}/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editId, name: text }),
        }); // localhost/items
        setEditId(null);
      } // Verificar se tem o id ou não
      else {
        // 🆕 LINHA 81: Calcula o maior ID numérico, usando 0 se a lista estiver vazia
        const maxId = Math.max(0, ...items.map(item => Number(item.id)));

        // 🆕 LINHA 82: Define o próximo ID
        const newId = maxId + 1;
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify({ id: newId, name: text }),
        });
      }
      setText('');
      fetchItems();
    }
    catch (error) {
      console.error('Error ao adicionar/editar: ', error);
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setText(item.name);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchItems();
    }
    catch (error) {
      console.error('Erro ao exlcluir item: ', error)
    }
  };

  if (loading) {  // Se estiver carregando alguma coisa
    return ( // carregando os dados exiba uma informação para o cliente que os dados estão sendo carregados
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CRUD com AsyncStorage</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite algo..."
          value={text}
          onChangeText={setText}
        />
        <Button title={editId ? 'Salvar' : 'Adicionar'} onPress={handleAdd} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item.name}</Text>
            <View style={styles.buttons}>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <Text style={styles.edit}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)} >
                <Text style={styles.delete}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  inputContainer: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1,
  },
  itemText: { fontSize: 18 },
  buttons: { flexDirection: 'row', gap: 15 },
  edit: { fontSize: 18 },
  delete: { fontSize: 18 },
  clearBtn: {
    marginTop: 20,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e53935',
    borderRadius: 8,
  },
  clearText: { color: '#fff', fontWeight: 'bold' },
});
