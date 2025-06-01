const apiUrl = 'http://localhost:3000/api';
let editingId = null; // Si no es null, estamos editando ese empleado

document.addEventListener('DOMContentLoaded', () => {
  // Detectamos si existe el formulario de login. Esto para saber si estamos en index.html
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', login);
  }

  // Detectamos si existe el formulario de agregar empleados. Si existe, estamos en dashboard.html
  const addForm = document.getElementById('addForm');
  if (addForm) {
    // Verificamos que haya token; si no, se denega el acceso y redirigimos a login
    checkAuth();

   
    addForm.addEventListener('submit', addEmpleado);
    document.getElementById('searchForm').addEventListener('submit', searchEmpleado);
    document.getElementById('clearSearch').addEventListener('click', () => {
      document.getElementById('searchName').value = '';
      fetchEmpleados();
    });

    // Cargamos la lista de empleados inicialmente
    fetchEmpleados();
  }
});


// FUNCIONES LOGIN  //

async function login(event) {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok && data.token) {
      localStorage.setItem('token', data.token);
      window.location.href = 'dashboard.html';
    } else {
      alert(data.msg || 'Credenciales inválidas');
    }
  } catch (err) {
    console.error('Error en login:', err);
    alert('Ocurrió un error al intentar iniciar sesión.');
  }
}


// FUNCIONES DASHBOARD     //


// Verifica que exista token. Si no, redirige a login.
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'index.html';
  }
}

// Logout: borra token y redirige al login
function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
}

// Obtiene todos los empleados (GET /api/employees)
async function fetchEmpleados() {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${apiUrl}/employees`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Error al obtener empleados');
    const data = await res.json();
    renderEmpleados(data);
  } catch (err) {
    console.error(err);
    alert('No se pudieron cargar los empleados');
  }
}

// Muestra la lista de empleados y agrega botones Editar/Eliminar
function renderEmpleados(data) {
  const ul = document.getElementById('empleados');
  ul.innerHTML = '';

  if (!Array.isArray(data) || data.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No se encontraron empleados.';
    ul.appendChild(li);
    return;
  }

  data.forEach(emp => {
    const li = document.createElement('li');
    li.textContent = `${emp.nombre} - ${emp.puesto}`;

    // Botón Editar
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Editar';
    editBtn.style.marginLeft = '10px';
    editBtn.onclick = () => startEditEmpleado(emp);
    li.appendChild(editBtn);

    // Botón Eliminar
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Eliminar';
    delBtn.style.marginLeft = '10px';
    delBtn.onclick = () => deleteEmpleado(emp._id);
    li.appendChild(delBtn);

    ul.appendChild(li);
  });
}

// Carga los datos del empleado en el formulario para editar
function startEditEmpleado(emp) {
  document.getElementById('nombre').value = emp.nombre;
  document.getElementById('puesto').value = emp.puesto;
  document.getElementById('departamento').value = emp.departamento;
  document.getElementById('salario').value = emp.salario;

  editingId = emp._id;
  document.getElementById('submitButton').textContent = 'Actualizar';
}

// Agrega o actualiza un empleado 
async function addEmpleado(event) {
  event.preventDefault();
  const token = localStorage.getItem('token');

  const empleado = {
    nombre: document.getElementById('nombre').value.trim(),
    puesto: document.getElementById('puesto').value.trim(),
    departamento: document.getElementById('departamento').value.trim(),
    salario: Number(document.getElementById('salario').value)
  };

  try {
    let res;
    // Si editingId NO es null, estamos editando
    if (editingId) {
      res = await fetch(`${apiUrl}/employees/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(empleado)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || errorData.error || 'Error al actualizar empleado');
      }
      await res.json();
      alert('Empleado actualizado');
      editingId = null;
      document.getElementById('submitButton').textContent = 'Agregar';
    } else {
      res = await fetch(`${apiUrl}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(empleado)
      });
      if (!res.ok) {
        throw new Error('Error al crear empleado');
      }
      await res.json();
      alert('Empleado agregado');
    }

    document.getElementById('addForm').reset();
    fetchEmpleados();
  } catch (err) {
    console.error(err);
    alert('Error: ' + err.message);
  }
}

// Elimina un empleado por ID 
async function deleteEmpleado(id) {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${apiUrl}/employees/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Error al eliminar empleado');
    await res.json();
    fetchEmpleados();
  } catch (err) {
    console.error(err);
    alert('No se pudo eliminar el empleado');
  }
}

// Busca empleados por nombre 
async function searchEmpleado(event) {
  event.preventDefault();
  const token = localStorage.getItem('token');
  const name = document.getElementById('searchName').value.trim();

  try {
    const res = await fetch(`${apiUrl}/employees?nombre=${encodeURIComponent(name)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Error al buscar empleados');
    const data = await res.json();
    renderEmpleados(data);
  } catch (err) {
    console.error(err);
    alert('Error al buscar empleados');
  }
}
