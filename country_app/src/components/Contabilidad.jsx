import { useState, useEffect, useRef } from "react"
import ReactDOM from "react-dom"
import "../CSS/Contabilidad.css"
import LogoutButton from './LogoutBoton'
import { UserPlus, Eye, XCircle, CheckCircle, Loader, Search, History, AlertTriangle, Clock, AlertCircle, Edit, Copy, ChevronLeft, ChevronRight } from "lucide-react"
import useRoleGuard from '../hooks/useRoleGuard';
import CaballosAdmin from "./CaballosAdmin";
import InstructorasAdmin from "./InstructorasAdmin";
import ReservasAdmin from "./ReservasAdmin";
import HorariosPersonalizadosAdmin from "./administrador/HorariosPersonalizadosAdmin";

const MembershipAdminDashboard = () => {
  useRoleGuard(['administrador', 'contabilidad']);

  const [members, setMembers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [modalOpen, setModalOpen] = useState(false)
  const [addClientModalOpen, setAddClientModalOpen] = useState(false)
  const [paymentHistoryModalOpen, setPaymentHistoryModalOpen] = useState(false)
  const [editPaymentModalOpen, setEditPaymentModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [originalMember, setOriginalMember] = useState(null)
  const [paymentHistory, setPaymentHistory] = useState([])
  const [editingPayment, setEditingPayment] = useState(null)
  const [newPayment, setNewPayment] = useState({
    monto: "",
    fecha_pago: "",
    concepto: "",
    estatus_pago: "pagado",
    metodo_pago: "efectivo",
    observaciones: "",
  })
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })
  const [creatingClient, setCreatingClient] = useState(false)
  const [paymentCounts, setPaymentCounts] = useState({})
  const [paymentStatus, setPaymentStatus] = useState({})
  const [showOverdueFilter, setShowOverdueFilter] = useState(false)
  const [withoutEmail, setWithoutEmail] = useState(false)
  const [previewCredentials, setPreviewCredentials] = useState({ username: "", password: "" })
  const [credentialsModalOpen, setCredentialsModalOpen] = useState(false)
  const [copyMessage, setCopyMessage] = useState("")
  const [userCreatedSuccessfully, setUserCreatedSuccessfully] = useState(false)
  const [newClient, setNewClient] = useState({
    nombre: "",
    apellido: "",
    email: "",
    edad: "",
    telefono: "",
    tipo_cliente: "",
    tipo_nivel: "",
    estatus: "activo",
    monto: "",
    fecha_pago: "",
    concepto: "",
    estatus_pago: "pagado",
    metodo_pago: "efectivo",
    observaciones: "",
  })
  const [previewEdited, setPreviewEdited] = useState(false)
  const [activeTab, setActiveTab] = useState("clientes")

  // Refs para controlar foco y autofill
  const searchRef = useRef(null)
  const editFirstInputRef = useRef(null)
  const addFirstInputRef = useRef(null)
  const headerRef = useRef(null)
  const statsRef = useRef(null)
  const controlsRef = useRef(null)
  const tabsRef = useRef(null)

  const capitalizeStatus = (status) => {
    if (!status) return "Activo"
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  }

  // Función para obtener icono y estilo de alerta de pago
  const getPaymentAlert = (memberId) => {
    const status = paymentStatus[memberId]
    if (!status) return null
    
    switch (status.estado_pago) {
      case 'vencido':
        return {
          icon: <AlertTriangle size={14} />,
          className: 'payment-alert payment-alert-overdue',
          title: `Pago vencido. Venció: ${status.proxima_fecha}`,
          text: 'VENCIDO'
        }
      case 'proximo_vencer':
        return {
          icon: <Clock size={14} />,
          className: 'payment-alert payment-alert-due-soon',
          title: `Próximo a vencer en ${status.dias_restantes} días. Vence: ${status.proxima_fecha}`,
          text: `${status.dias_restantes}d`
        }
      default:
        return null
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0]
  }

  // Función auxiliar para copiar texto al portapapeles (fallback)
  const fallbackCopyTextToClipboard = (text) => {
    return new Promise((resolve, reject) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) {
          resolve();
        } else {
          reject(new Error('Fallback: Copy command failed'));
        }
      } catch (err) {
        document.body.removeChild(textArea);
        reject(err);
      }
    });
  }

  // Funciones para generar credenciales en frontend (solo para vista previa)
  const generateSecurePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const allChars = uppercase + lowercase + numbers;
    
    let password = '';
    // Asegurar al menos 1 mayúscula, 1 minúscula y 1 número
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    
    // Completar con caracteres aleatorios hasta llegar a 8
    for (let i = 3; i < 8; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Mezclar los caracteres
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const normalizeText = (text, maxLength = 10) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .substring(0, maxLength);
  };

  const getFirstWord = (text) => {
    const firstWord = text.trim().split(/\s+/)[0];
    return normalizeText(firstWord, 8);
  };

  const generatePreviewUsername = (nombre, apellido) => {
    if (!nombre.trim() || !apellido.trim()) return '';
    
    const primerNombre = getFirstWord(nombre);
    const primerApellido = getFirstWord(apellido);
    
    let baseUsername = `${primerNombre}.${primerApellido}`;
    
    if (baseUsername.length < 4) {
      baseUsername = primerNombre + primerApellido;
    }
    
    if (baseUsername.length > 15) {
      const apellidoTruncado = primerApellido.substring(0, 15 - primerNombre.length - 1);
      baseUsername = `${primerNombre}.${apellidoTruncado}`;
    }
    
    return baseUsername;
  };

  // Función para obtener las credenciales reales del servidor (con verificación de duplicados)
  const getRealCredentials = async (nombre, apellido, customPassword = null) => {
    try {
      const response = await fetch("http://localhost:3001/api/users/preview-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, apellido, customPassword }),
      })
      
      if (response.ok) {
        const result = await response.json()
        return result.credentials
      }
    } catch (error) {
      console.error("Error obteniendo credenciales reales:", error)
    }
    return null
  }

  // Función para formatear números con separadores de miles
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return ""
    const num = parseFloat(amount)
    if (isNaN(num)) return ""
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })
  }

  // Función para formatear número con separadores de miles para input
  const formatNumberInput = (value) => {
    if (!value) return ""
    // Remover todo excepto números y punto decimal
    const numericValue = value.toString().replace(/[^\d.]/g, '')
    if (!numericValue) return ""
    // Convertir a número y formatear
    const num = parseFloat(numericValue)
    if (isNaN(num)) return ""
    // Formatear con separadores de miles
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })
  }

  // Función para parsear valor formateado a número
  const parseFormattedNumber = (formattedValue) => {
    if (!formattedValue) return ""
    // Remover separadores de miles y convertir a número
    const numericValue = formattedValue.toString().replace(/,/g, '')
    const num = parseFloat(numericValue)
    return isNaN(num) ? "" : num
  }

  // Función para mostrar notificaciones
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" })
    }, 4000) // Ocultar después de 4 segundos
  }

  // Función para cargar conteo de pagos
  const loadPaymentCounts = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/users/payment-counts")
      if (response.ok) {
        const counts = await response.json()
        const countsMap = {}
        counts.forEach(item => {
          countsMap[item.id_usuario] = item.total_pagos
        })
        setPaymentCounts(countsMap)
      }
    } catch (error) {
      console.error("Error cargando conteo de pagos:", error)
    }
  }

  // Función para cargar estado de pagos (vencidos, próximos a vencer)
  const loadPaymentStatus = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/users/payment-status")
      if (response.ok) {
        const status = await response.json()
        const statusMap = {}
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        status.forEach(item => {
          let estado_pago = 'al_dia';
          let dias_restantes = null;
          
          // Calcular próxima fecha de pago y estado
          if (item.ultimo_pago) {
            // Parsear fecha en zona horaria local
            const [year, month, day] = item.ultimo_pago.split('-').map(Number);
            const ultimoPago = new Date(year, month - 1, day);
            
            // Sumar 1 mes
            const proximaFecha = new Date(ultimoPago);
            proximaFecha.setMonth(proximaFecha.getMonth() + 1);
            proximaFecha.setHours(0, 0, 0, 0);
            
            const diffTime = proximaFecha - hoy;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) {
              estado_pago = 'vencido';
              dias_restantes = diffDays; // Negativo
            } else if (diffDays <= 7) {
              estado_pago = 'proximo_vencer';
              dias_restantes = diffDays;
            } else {
              estado_pago = 'al_dia';
              dias_restantes = diffDays;
            }
            
            // Formatear próxima fecha manualmente
            const nextYear = proximaFecha.getFullYear();
            const nextMonth = String(proximaFecha.getMonth() + 1).padStart(2, '0');
            const nextDay = String(proximaFecha.getDate()).padStart(2, '0');
            const proximaFechaStr = `${nextYear}-${nextMonth}-${nextDay}`;
            
            statusMap[item.cliente_id] = {
              estado_pago: estado_pago,
              dias_restantes: dias_restantes,
              ultimo_pago: item.ultimo_pago,
              proxima_fecha: proximaFechaStr
            }
          }
        })
        setPaymentStatus(statusMap)
      }
    } catch (error) {
      console.error("Error cargando estado de pagos:", error)
    }
  }

  useEffect(() => {
    refreshUsersList()
    loadPaymentCounts()
    loadPaymentStatus()
  }, [])

  // Implementar sticky header con scroll listener
  useEffect(() => {
    if (activeTab !== 'clientes' || loading) return

    const table = document.querySelector('.members-table')
    const thead = table?.querySelector('thead')
    if (!table || !thead) return

    let stickyHeader = null
    let originalHeaderTop = 0

    const calculateHeaderPosition = () => {
      const tableRect = table.getBoundingClientRect()
      const theadRect = thead.getBoundingClientRect()
      originalHeaderTop = theadRect.top + window.scrollY
      return { tableRect, theadRect }
    }

    const handleScroll = () => {
      const { tableRect, theadRect } = calculateHeaderPosition()
      const scrollTop = window.scrollY || window.pageYOffset

      // Si el header original está fuera de vista hacia arriba
      if (theadRect.top <= 0 && tableRect.bottom > 100) {
        // Crear header flotante si no existe
        if (!stickyHeader) {
          stickyHeader = thead.cloneNode(true)
          // fixed para que quede en top del viewport
          stickyHeader.style.position = 'fixed'
          stickyHeader.style.top = '0'
          // ancho/left los calculamos dinámicamente con getBoundingClientRect
          stickyHeader.style.zIndex = '999'
          stickyHeader.classList.add('sticky-clone')
          
          // Forzar que el clone se renderice como tabla para respetar celdas
          stickyHeader.style.display = 'table'
          // Copiar estilos de table-layout si aplica
          try {
            const computed = window.getComputedStyle(table)
            if (computed && computed.tableLayout) {
              stickyHeader.style.tableLayout = computed.tableLayout
            }
          } catch (e) {}

          // Copiar anchos iniciales usando getBoundingClientRect (más preciso)
          const originalThs = thead.querySelectorAll('th')
          const clonedThs = stickyHeader.querySelectorAll('th')
          originalThs.forEach((th, index) => {
            if (clonedThs[index]) {
              const w = th.getBoundingClientRect().width
              clonedThs[index].style.width = `${Math.round(w)}px`
            }
          })

          document.body.appendChild(stickyHeader)
        }

        // Actualizar posición y ancho del clone con medidas exactas
        if (stickyHeader) {
          const rect = table.getBoundingClientRect()
          stickyHeader.style.left = `${Math.round(rect.left)}px`
          stickyHeader.style.width = `${Math.round(rect.width)}px`
          stickyHeader.style.display = 'table-header-group'

          // Actualizar anchos usando getBoundingClientRect para evitar desincronías
          const originalThs2 = thead.querySelectorAll('th')
          const clonedThs2 = stickyHeader.querySelectorAll('th')
          originalThs2.forEach((th, index) => {
            if (clonedThs2[index]) {
              const w = th.getBoundingClientRect().width
              clonedThs2[index].style.width = `${Math.round(w)}px`
            }
          })
          // Sincronizar horizontalmente por si existe scroll interno
          handleTableScroll()
        }
      } else {
        // Remover header flotante
        if (stickyHeader) {
          stickyHeader.remove()
          stickyHeader = null
        }
      }
    }

    const handleTableScroll = () => {
      if (stickyHeader) {
        const tableContainer = document.querySelector('.table-container')
        if (tableContainer) {
            const rect = table.getBoundingClientRect()
            // Actualizar anchos de columnas con getBoundingClientRect (más preciso)
            const originalThs = thead.querySelectorAll('th')
            const clonedThs = stickyHeader.querySelectorAll('th')
            originalThs.forEach((th, index) => {
              if (clonedThs[index]) {
                const w = th.getBoundingClientRect().width
                clonedThs[index].style.width = `${Math.round(w)}px`
              }
            })
            // Ajustar left para sincronizar con scroll horizontal usando rect.left
            stickyHeader.style.left = `${Math.round(rect.left)}px`
            stickyHeader.style.width = `${Math.round(rect.width)}px`
        }
      }
    }

    // Esperar a que la tabla esté completamente renderizada
    const initTimeout = setTimeout(() => {
      calculateHeaderPosition()
      handleScroll()
      window.addEventListener('scroll', handleScroll)
      window.addEventListener('resize', handleScroll)
      const tableContainer = document.querySelector('.table-container')
      if (tableContainer) {
        tableContainer.addEventListener('scroll', handleTableScroll)
      }
    }, 100)

    return () => {
      clearTimeout(initTimeout)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      const tableContainer = document.querySelector('.table-container')
      if (tableContainer) {
        tableContainer.removeEventListener('scroll', handleTableScroll)
      }
      if (stickyHeader) {
        stickyHeader.remove()
      }
    }
  }, [activeTab, loading, members, searchTerm, statusFilter])

  // Generar credenciales de vista previa cuando cambian nombre/apellido
  useEffect(() => {
    if (withoutEmail && newClient.nombre && newClient.apellido) {
      // Solo generar credenciales automáticamente si el usuario NO ha editado manualmente la contraseña
      if (!previewEdited) {
        const updateRealCredentials = async () => {
          try {
            const password = previewCredentials.password || generateSecurePassword();
            const realCredentials = await getRealCredentials(newClient.nombre, newClient.apellido, password);
            if (realCredentials) {
              setPreviewCredentials(realCredentials);
              setPreviewEdited(false);
            } else {
              // Fallback a credenciales de vista previa
              const username = generatePreviewUsername(newClient.nombre, newClient.apellido);
              setPreviewCredentials({ username, password });
              setPreviewEdited(false);
            }
          } catch (error) {
            console.error('Error al obtener credenciales reales:', error);
            // Fallback a credenciales de vista previa
            const username = generatePreviewUsername(newClient.nombre, newClient.apellido);
            const password = previewCredentials.password || generateSecurePassword();
            setPreviewCredentials({ username, password });
            setPreviewEdited(false);
          }
        };
        // Debounce para evitar actualizaciones constantes
        const timeoutId = setTimeout(updateRealCredentials, 500);
        return () => clearTimeout(timeoutId);
      }
    } else if (!withoutEmail) {
      setPreviewCredentials({ username: "", password: "" });
      setPreviewEdited(false);
    }
  }, [withoutEmail, newClient.nombre, newClient.apellido, previewEdited]);

  // Obtener usuario actual del localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  }, []);

  // Bloquear scroll cuando un modal está abierto
  useEffect(() => {
    const anyModalOpen = modalOpen || addClientModalOpen || paymentHistoryModalOpen
    if (anyModalOpen) document.body.classList.add("no-scroll")
    else document.body.classList.remove("no-scroll")
    return () => document.body.classList.remove("no-scroll")
  }, [modalOpen, addClientModalOpen, paymentHistoryModalOpen])

  // Cerrar con ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        if (modalOpen) closeModal()
        if (addClientModalOpen) closeAddClientModal()
        if (paymentHistoryModalOpen) closePaymentHistoryModal()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [modalOpen, addClientModalOpen, paymentHistoryModalOpen])

  const normalize = (str) => (str || "").toLowerCase().replace(/\s+/g, "")
  const filteredMembers = members
    .filter((member) => member.rol === "cliente")
    .filter(
      (member) => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "" || normalize(member.status) === normalize(statusFilter);
        const matchesOverdue = showOverdueFilter ? paymentStatus[member.id]?.estado_pago === "vencido" : true;
        
        return matchesSearch && matchesStatus && matchesOverdue;
      }
    )

  // Calcular paginación
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentMembers = filteredMembers.slice(startIndex, endIndex)

  // Resetear a la primera página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, showOverdueFilter])

  const openModal = (member) => {
    setSelectedMember(member)
    setOriginalMember({ ...member })
    // Quitar foco del buscador (evita que el navegador “recuerde” y escriba algo)
    searchRef.current?.blur()
    setModalOpen(true)
    // Enfocar el primer input del modal
    setTimeout(() => editFirstInputRef.current?.focus(), 0)
  }

  const closeModal = () => {
    setSelectedMember(null)
    setOriginalMember(null)
    setModalOpen(false)
  }

  const openAddClientModal = () => {
    setNewClient({
      nombre: "",
      apellido: "",
      email: "",
      edad: "",
      telefono: "",
      tipo_cliente: "",
      tipo_nivel: "",
      estatus: "activo",
      monto: "",
      fecha_pago: "",
      concepto: "",
      estatus_pago: "pagado",
      metodo_pago: "efectivo",
      observaciones: "",
    })
    setWithoutEmail(false)
    setPreviewCredentials({ username: "", password: "" })
    setPreviewEdited(false)
    setUserCreatedSuccessfully(false)
    setCopyMessage("")
    searchRef.current?.blur() // Quitar foco del buscador
    setAddClientModalOpen(true)
    setTimeout(() => addFirstInputRef.current?.focus(), 0)
  }

  const closeAddClientModal = () => {
    setAddClientModalOpen(false)
    setWithoutEmail(false)
    setPreviewCredentials({ username: "", password: "" })
    setPreviewEdited(false)
    setUserCreatedSuccessfully(false)
    setCopyMessage("")
    setNewClient({
      nombre: "",
      apellido: "",
      email: "",
      edad: "",
      telefono: "",
      tipo_cliente: "",
      tipo_nivel: "",
      estatus: "activo",
      monto: "",
      fecha_pago: "",
      concepto: "",
      estatus_pago: "pagado",
      metodo_pago: "efectivo",
      observaciones: "",
    })
  }

  const openPaymentHistoryModal = async (member) => {
    setSelectedMember(member)
    setNewPayment({
      monto: "",
      fecha_pago: "",
      concepto: "",
      estatus_pago: "pagado",
      metodo_pago: "efectivo",
      observaciones: "",
    })
    
    // Cargar historial de pagos
    try {
      const response = await fetch(`http://localhost:3001/api/users/payment-history/${member.id}`)
      if (response.ok) {
        const history = await response.json()
        setPaymentHistory(history)
      } else {
        setPaymentHistory([])
      }
    } catch (error) {
      console.error("Error cargando historial:", error)
      setPaymentHistory([])
    }
    
    setPaymentHistoryModalOpen(true)
  }

  const closePaymentHistoryModal = () => {
    setPaymentHistoryModalOpen(false)
    setSelectedMember(null)
    setPaymentHistory([])
    setNewPayment({
      monto: "",
      fecha_pago: "",
      concepto: "",
      estatus_pago: "pagado",
      metodo_pago: "efectivo",
      observaciones: "",
    })
  }

  // Funciones para el modal de edición de pagos
  const openEditPaymentModal = (payment) => {
    setEditingPayment({
      ...payment,
      fecha_pago: formatDate(payment.fecha_pago)
    })
    setEditPaymentModalOpen(true)
  }

  const closeEditPaymentModal = () => {
    setEditPaymentModalOpen(false)
    setEditingPayment(null)
  }

  const updatePayment = async () => {
    try {
      if (!editingPayment.monto || !editingPayment.fecha_pago || !editingPayment.concepto) {
        showNotification("Por favor completa todos los campos requeridos", "error")
        return
      }

      const response = await fetch(`http://localhost:3001/api/users/payment/${editingPayment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          monto: editingPayment.monto,
          fecha_pago: editingPayment.fecha_pago,
          concepto: editingPayment.concepto,
          estatus_pago: editingPayment.estatus_pago || "pagado",
          metodo_pago: editingPayment.metodo_pago || "efectivo",
          observaciones: editingPayment.observaciones || null,
        }),
      })

      if (response.ok) {
        // Recargar el historial de pagos
        await openPaymentHistoryModal(selectedMember)
        
        // Actualizar conteos y estados
        loadPaymentCounts()
        loadPaymentStatus()
        
        // Mostrar notificación y cerrar modal
        showNotification("Pago actualizado correctamente", "success")
        closeEditPaymentModal()
      } else {
        const error = await response.json()
        showNotification("Error al actualizar pago: " + (error?.error ?? "Error desconocido"), "error")
      }
    } catch (error) {
      console.error("Error actualizando pago:", error)
      showNotification("Error al actualizar pago", "error")
    }
  }

  const addNewPayment = async () => {
    try {
      if (!newPayment.monto || !newPayment.fecha_pago || !newPayment.concepto) {
        showNotification("Por favor completa todos los campos requeridos del pago", "error")
        return
      }

      const paymentData = {
        cliente_id: selectedMember.id,
        monto: parseFloat(newPayment.monto),
        fecha_pago: newPayment.fecha_pago,
        concepto: newPayment.concepto,
        estatus_pago: newPayment.estatus_pago || "pagado",
        metodo_pago: newPayment.metodo_pago || "efectivo",
        observaciones: newPayment.observaciones || null
      }

      const response = await fetch("http://localhost:3001/api/users/add-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      })

      if (response.ok) {
        // Recargar historial de pagos
        const historyResponse = await fetch(`http://localhost:3001/api/users/payment-history/${selectedMember.id}`)
        if (historyResponse.ok) {
          const history = await historyResponse.json()
          setPaymentHistory(history)
        }
        
        // Actualizar lista de usuarios
        refreshUsersList()
        
        // Actualizar conteo de pagos
        loadPaymentCounts()
        loadPaymentStatus()
        
        // Mostrar notificación de éxito
        showNotification("Pago agregado correctamente", "success")
        
        // Cerrar modal después de un breve delay
        setTimeout(() => {
          closePaymentHistoryModal()
        }, 1500)
        
      } else {
        const error = await response.json()
        showNotification("Error al agregar pago: " + (error?.error ?? "Error desconocido"), "error")
      }
    } catch (error) {
      showNotification("Error de conexión. Inténtalo de nuevo.", "error")
    }
  }

  const createNewClient = async () => {
    if (creatingClient) return;
    setCreatingClient(true);
    try {
      if (!newClient.nombre || !newClient.apellido) {
        showNotification("Por favor completa el nombre y apellido del cliente", "error")
        return;
      }
      
      // Validación específica para usuarios con email
      if (!withoutEmail) {
        if (!newClient.email) {
          showNotification("Por favor completa el email del cliente", "error")
          return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(newClient.email)) {
          showNotification("Por favor ingresa un email válido", "error")
          return;
        }
      }
      
      // Validación de contraseña para usuarios sin email
      if (withoutEmail) {
        if (!previewCredentials.password || previewCredentials.password.length < 8) {
          showNotification("La contraseña debe tener al menos 8 caracteres", "error")
          return;
        }
      }
      
      // Validación de información de pagos
      if (!newClient.monto || !newClient.fecha_pago || !newClient.concepto) {
        showNotification("Por favor completa toda la información de pagos (monto, fecha de pago y concepto)", "error")
        return;
      }

      // Obtener credenciales reales antes de crear
      let finalCredentials = null;
      if (withoutEmail && newClient.nombre && newClient.apellido) {
        finalCredentials = await getRealCredentials(
          newClient.nombre,
          newClient.apellido,
          previewCredentials.password
        );
        if (finalCredentials) {
          setPreviewCredentials(finalCredentials);
          setPreviewEdited(false);
        }
      }

      // Preparar datos del cliente
      const clientData = {
        nombre: newClient.nombre,
        apellido: newClient.apellido,
        email: withoutEmail ? undefined : newClient.email,
        correo: withoutEmail ? undefined : newClient.email,
        edad: newClient.edad || null,
        telefono: newClient.telefono || null,
        tipo_cliente: newClient.tipo_cliente || null,
        tipo_nivel: newClient.tipo_nivel || null,
        estatus: newClient.estatus || "activo",
        rol: "cliente",
        withoutEmail: withoutEmail,
        ...(finalCredentials?.password && {
          customPassword: finalCredentials.password,
        }),
        // Información de pago
        monto: parseFloat(newClient.monto),
        fecha_pago: newClient.fecha_pago,
        concepto: newClient.concepto,
        estatus_pago: newClient.estatus_pago || "pagado",
        metodo_pago: newClient.metodo_pago || "efectivo",
        observaciones: newClient.observaciones || null,
      }

      const response = await fetch("http://localhost:3001/api/users/register-cliente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      })
      
      if (response.ok) {
        const result = await response.json()
        refreshUsersList()
        loadPaymentCounts()
        loadPaymentStatus()
        
        // El backend ya envía el email automáticamente si el cliente tiene correo
        if (newClient.email && !withoutEmail) {
          showNotification(
            `✅ Cliente creado exitosamente. Credenciales enviadas por email a ${newClient.email}`, 
            "success"
          );
        } else if (withoutEmail && result.credentials) {
          // Actualizar las credenciales con las reales del servidor
          setPreviewCredentials({
            username: result.credentials.username,
            password: result.credentials.password
          })
          setUserCreatedSuccessfully(true)
          
          showNotification(
            `🔒 Cliente creado. Las credenciales NO se enviarán por correo. Debes copiarlas y entregarlas personalmente.`, 
            "success"
          )
        } else {
          showNotification("Cliente registrado correctamente", "success")
        }
        
        closeAddClientModal()
      } else {
        const error = await response.json()
        showNotification("Error al crear cliente: " + (error?.error ?? "Error desconocido"), "error")
      }
    } catch (error) {
      console.error("Error al crear cliente:", error)
      showNotification("Error de conexión. Inténtalo de nuevo.", "error")
    } finally {
      setCreatingClient(false);
    }
  }

  const refreshUsersList = () => {
    setLoading(true)
    fetch("http://localhost:3001/api/users/users-with-payments")
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((u) => {
          // Calcular próxima fecha de pago: última fecha + 1 mes
          let proximaFecha = "";
          if (u.fecha_pago) {
            // Parsear la fecha en zona horaria local
            const [year, month, day] = u.fecha_pago.split('-').map(Number);
            const fechaPago = new Date(year, month - 1, day); // month - 1 porque los meses en JS van de 0-11
            
            if (!isNaN(fechaPago.getTime())) {
              // Sumar 1 mes
              fechaPago.setMonth(fechaPago.getMonth() + 1);
              
              // Formatear como YYYY-MM-DD manualmente para evitar problemas de zona horaria
              const nextYear = fechaPago.getFullYear();
              const nextMonth = String(fechaPago.getMonth() + 1).padStart(2, '0');
              const nextDay = String(fechaPago.getDate()).padStart(2, '0');
              proximaFecha = `${nextYear}-${nextMonth}-${nextDay}`;
            }
          }
          
          return {
            id: u.id,
            name: u.nombre + (u.apellido ? " " + u.apellido : ""),
            email: u.email || "",
            status: capitalizeStatus(u.estatus),
            monthlyFee: u.monto || 0,
            paymentDate: "",
            lastPaymentDate: u.fecha_pago || "",
            proximaFecha: proximaFecha,
            rol: u.rol || "",
            tipo_nivel: u.tipo_nivel || "",
          };
        })
        setMembers(mapped)
        setLoading(false)
      })
      .catch(() => {
        setMembers([])
        setLoading(false)
      })
  }

  const saveMemberChanges = async () => {
    try {
      const changes = {}
      let hasChanges = false

      if (selectedMember.monthlyFee !== originalMember.monthlyFee) {
        changes.monto = selectedMember.monthlyFee || 0
        hasChanges = true
      }
      if (selectedMember.lastPaymentDate !== originalMember.lastPaymentDate) {
        if (!selectedMember.lastPaymentDate) {
          showNotification("Por favor completa la fecha de último pago", "error")
          return
        }
        changes.fecha_pago = selectedMember.lastPaymentDate
        hasChanges = true
      }
      // Nota: proxima_fecha no existe en la tabla contabilidad, se maneja a través del historial de pagos

      if (!hasChanges) {
        closeModal()
        return
      }

      changes.id_usuario = selectedMember.id

      const paymentResponse = await fetch("http://localhost:3001/api/users/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      })

      if (paymentResponse.ok) {
        setMembers((prev) => prev.map((m) => (m.id === selectedMember.id ? selectedMember : m)))
        closeModal()
        showNotification("Información de pago actualizada correctamente", "success")
      } else {
        const error = await paymentResponse.json()
        showNotification("Error al guardar información de pago: " + (error?.error ?? "Error desconocido"), "error")
      }
    } catch {
      showNotification("Error de conexión. Inténtalo de nuevo.", "error")
    }
  }

  const isPaymentExpired = (paymentDate) => {
    const today = new Date()
    const payment = new Date(paymentDate)
    if (isNaN(payment.getTime())) return false
    return today > payment
  }

  // Solo usuarios con rol cliente
  const clientMembers = members.filter(m => m.rol === "cliente")
  const totalUsers = clientMembers.length
  const activeUsers = clientMembers.filter((m) => m.status === "Activo" && !isPaymentExpired(m.paymentDate)).length
  const blockedUsers = clientMembers.filter(
    (m) => m.status === "Bloqueado" || (m.status === "Activo" && isPaymentExpired(m.paymentDate)),
  ).length
  const pendingUsers = clientMembers.filter((m) => m.status === "Pendiente").length

  const renderPortal = (node) => ReactDOM.createPortal(node, document.body)

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div ref={headerRef} className="dashboard-header enhanced-header">
        <div className="header-texts">
          <h1 className="header-title">Panel de Administrador</h1>
          <p className="header-subtitle">Gestiona usuarios y membresías de tu plataforma</p>
        </div>
        <div className="header-actions">
          {currentUser && (
            <LogoutButton 
              userName={currentUser.nombre || 'Admin'} 
              showUserName={true}
            />
          )}
          <button className="add-client-btn" onClick={openAddClientModal} type="button">
            <UserPlus size={20} /> Nuevo Cliente
          </button>
        </div>
      </div>

      {/* ESTADÍSTICAS */}
      <div ref={statsRef} className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-topline" style={{ backgroundColor: "#c17b4a" }}></div>
          <div className="stat-title">Usuarios Totales</div>
          <div className="stat-value">{totalUsers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-topline" style={{ backgroundColor: "#9caf88" }}></div>
          <div className="stat-title">Activos</div>
          <div className="stat-value">{activeUsers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-topline" style={{ backgroundColor: "#8b5a2b" }}></div>
          <div className="stat-title">Bloqueados</div>
          <div className="stat-value">{blockedUsers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-topline" style={{ backgroundColor: "#d4a574" }}></div>
          <div className="stat-title">Pendientes</div>
          <div className="stat-value">{pendingUsers}</div>
        </div>
      </div>

      {/* NAVEGACIÓN DE PESTAÑAS */}
      <div ref={tabsRef} className="admin-tabs" style={{ 
        display: "flex", 
        gap: "0.5rem", 
        marginTop: "2rem",
        borderBottom: "2px solid #eee",
        paddingBottom: "0"
      }}>
        <button
          className={activeTab === "clientes" ? "tab-active" : "tab-inactive"}
          onClick={() => setActiveTab("clientes")}
          style={{ 
            padding: "0.8rem 1.8rem", 
            border: "none", 
            borderBottom: activeTab === "clientes" ? "3px solid #2d5016" : "3px solid transparent",
            fontWeight: "bold", 
            background: "transparent",
            color: activeTab === "clientes" ? "#2d5016" : "#4a7a2d", 
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          Clientes
        </button>
        <button
          className={activeTab === "caballos" ? "tab-active" : "tab-inactive"}
          onClick={() => setActiveTab("caballos")}
          style={{ 
            padding: "0.8rem 1.8rem", 
            border: "none", 
            borderBottom: activeTab === "caballos" ? "3px solid #2d5016" : "3px solid transparent",
            fontWeight: "bold", 
            background: "transparent",
            color: activeTab === "caballos" ? "#2d5016" : "#4a7a2d", 
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          Caballos
        </button>
        <button
          className={activeTab === "instructoras" ? "tab-active" : "tab-inactive"}
          onClick={() => setActiveTab("instructoras")}
          style={{ 
            padding: "0.8rem 1.8rem", 
            border: "none", 
            borderBottom: activeTab === "instructoras" ? "3px solid #2d5016" : "3px solid transparent",
            fontWeight: "bold", 
            background: "transparent",
            color: activeTab === "instructoras" ? "#2d5016" : "#4a7a2d", 
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          Instructoras
        </button>
        <button
          className={activeTab === "reservas" ? "tab-active" : "tab-inactive"}
          onClick={() => setActiveTab("reservas")}
          style={{ 
            padding: "0.8rem 1.8rem", 
            border: "none", 
            borderBottom: activeTab === "reservas" ? "3px solid #2d5016" : "3px solid transparent",
            fontWeight: "bold", 
            background: "transparent",
            color: activeTab === "reservas" ? "#2d5016" : "#4a7a2d", 
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          Reservas
        </button>
        <button
          className={activeTab === "horariosPersonalizados" ? "tab-active" : "tab-inactive"}
          onClick={() => setActiveTab("horariosPersonalizados")}
          style={{ 
            padding: "0.8rem 1.8rem", 
            border: "none", 
            borderBottom: activeTab === "horariosPersonalizados" ? "3px solid #2d5016" : "3px solid transparent",
            fontWeight: "bold", 
            background: "transparent",
            color: activeTab === "horariosPersonalizados" ? "#2d5016" : "#4a7a2d", 
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          Horarios Extras
        </button>
      </div>

      {/* CONTENIDO DE CLIENTES */}
      {activeTab === "clientes" && (
        <div style={{ marginTop: "2rem", overflow: "visible" }}>
          {/* CONTROLES */}
          <div ref={controlsRef} className="controls-container enhanced-controls">
            <div className="controls-inner">
              <div className="search-filter-group enhanced-search-filter">
                <Search size={18} className="search-icon external-search-icon" />
                <div className="search-box">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Buscar usuario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    ref={searchRef}
                    autoComplete="off"
                    name="dashboard-search"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="search"
                    data-lpignore="true"
                    data-form-type="other"
                  />
                </div>
                <div className="filter-box">
                  <select className="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">Todos</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Bloqueado">Bloqueado</option>
                    <option value="Pendiente">Pendiente</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowOverdueFilter(!showOverdueFilter)}
                  style={{
                    padding: "0.7rem 1.5rem",
                    background: showOverdueFilter 
                      ? "linear-gradient(135deg, #38a169 0%, #2f855a 100%)" 
                      : "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
                    color: "white",
                    border: showOverdueFilter ? "2px solid #68d391" : "2px solid transparent",
                    borderRadius: "8px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    boxShadow: showOverdueFilter 
                      ? "0 4px 12px rgba(56,161,105,0.4), inset 0 2px 4px rgba(255,255,255,0.2)" 
                      : "0 2px 8px rgba(255,107,107,0.3)",
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = showOverdueFilter 
                      ? "0 6px 16px rgba(56,161,105,0.5), inset 0 2px 4px rgba(255,255,255,0.2)"
                      : "0 4px 12px rgba(255,107,107,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = showOverdueFilter 
                      ? "0 4px 12px rgba(56,161,105,0.4), inset 0 2px 4px rgba(255,255,255,0.2)"
                      : "0 2px 8px rgba(255,107,107,0.3)";
                  }}
                >
                  {showOverdueFilter ? (
                    <>
                      <CheckCircle size={18} />
                      <span>Filtro Activo</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={18} />
                      <span>Mostrar Vencidos</span>
                    </>
                  )}
                  {(() => {
                    const count = members.filter(m => 
                      m.rol === "cliente" && paymentStatus[m.id]?.estado_pago === "vencido"
                    ).length;
                    return count > 0 ? (
                      <span style={{
                        background: showOverdueFilter 
                          ? "rgba(255,255,255,0.25)" 
                          : "rgba(255,255,255,0.3)",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "12px",
                        fontSize: "0.85rem",
                        fontWeight: "700",
                        minWidth: "24px",
                        textAlign: "center"
                      }}>{count}</span>
                    ) : null;
                  })()}
                </button>
              </div>
            </div>
          </div>

          {/* TABLA */}
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "4rem 2rem",
                background: "rgba(255, 255, 255, 0.9)",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(107,68,35,0.06)",
              }}
            >
              <Loader size={40} className="spin" style={{ color: "var(--terracotta)", marginBottom: "1rem" }} />
              <div
                style={{
                  color: "var(--primary-brown)",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                }}
              >
                Cargando usuarios...
              </div>
            </div>
          ) : (
            <div className="table-container">
              <div className="table-wrapper">
                <table className="members-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Estado</th>
                      <th>Nivel</th>
                      <th>Mensualidad</th>
                      <th>Último Pago</th>
                      <th>Próximo Pago</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          textAlign: "center",
                          padding: "3rem",
                          color: "var(--terracotta)",
                          fontSize: "1.1rem",
                          fontWeight: "600",
                        }}
                      >
                        {searchTerm || statusFilter
                          ? "No se encontraron usuarios con los filtros aplicados."
                          : "No hay usuarios con rol de cliente."}
                      </td>
                    </tr>
                  ) : (
                    currentMembers.map((member) => {
                      const expired = isPaymentExpired(member.paymentDate)
                      const displayStatus = expired && member.status === "Activo" ? "Bloqueado" : member.status

                      return (
                        <tr key={member.id}>
                          <td style={{ fontWeight: "600" }}>{member.name}</td>
                          <td>
                            {member.email ? (
                              <span style={{ color: "var(--stone-gray)" }}>{member.email}</span>
                            ) : (
                              <span
                                style={{
                                  color: "#dc3545",
                                  fontWeight: "bold",
                                  fontSize: "13px",
                                  fontStyle: "italic",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  backgroundColor: "#f8d7da",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  display: "inline-block",
                                }}
                              >
                                Sin correo registrado
                              </span>
                            )}
                          </td>
                          <td>
                            <select
                              className="status-badge"
                              value={member.status}
                              onChange={async (e) => {
                                const newStatus = e.target.value
                                try {
                                  const response = await fetch(
                                      `http://localhost:3001/api/users/update-status/${member.id}`,
                                      {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ estatus: newStatus }),
                                      },
                                    )
                                  if (response.ok) {
                                    setMembers((prev) =>
                                      prev.map((m) => (m.id === member.id ? { ...m, status: newStatus } : m)),
                                    )
                                    showNotification("Estado actualizado correctamente", "success")
                                  } else {
                                    const error = await response.json()
                                    showNotification("Error al actualizar el estado: " + (error?.error ?? "Error desconocido"), "error")
                                  }
                                } catch {
                                  showNotification("Error de conexión. Inténtalo de nuevo.", "error")
                                }
                              }}
                              style={{
                                borderColor:
                                  displayStatus === "Activo"
                                    ? "#9caf88"
                                    : displayStatus === "Inactivo"
                                      ? "#c17b4a"
                                      : displayStatus === "Pendiente"
                                        ? "#d4a574"
                                        : "#8b5a2b",
                                color:
                                  displayStatus === "Activo"
                                    ? "#9caf88"
                                    : displayStatus === "Inactivo"
                                      ? "#c17b4a"
                                      : displayStatus === "Pendiente"
                                        ? "#d4a574"
                                        : "#8b5a2b",
                              }}
                            >
                              <option value="Activo">Activo</option>
                              <option value="Inactivo">Inactivo</option>
                              <option value="Bloqueado">Bloqueado</option>
                              <option value="Pendiente">Pendiente</option>
                            </select>
                          </td>
                          <td>
                            <select
                              value={member.tipo_nivel || ""}
                              onChange={async (e) => {
                                const newNivel = e.target.value;
                                try {
                                  const response = await fetch(`http://localhost:3001/api/users/update-nivel/${member.id}`,
                                    {
                                      method: "PATCH",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ tipo_nivel: newNivel }),
                                    }
                                  );
                                  if (response.ok) {
                                    setMembers((prev) =>
                                      prev.map((m) => (m.id === member.id ? { ...m, tipo_nivel: newNivel } : m))
                                    );
                                    showNotification("Nivel actualizado correctamente", "success");
                                  } else {
                                    const error = await response.json();
                                    showNotification("Error al actualizar el nivel: " + (error?.error ?? "Error desconocido"), "error");
                                  }
                                } catch {
                                  showNotification("Error de conexión. Inténtalo de nuevo.", "error");
                                }
                              }}
                              className="status-filter"
                              style={{
                                padding: "0.5rem 1rem",
                                border: "2px solid var(--terracotta)",
                                borderRadius: "8px",
                                background: "white",
                                color: "var(--primary-brown)",
                                fontWeight: "500",
                                minWidth: "120px",
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                              }}
                            >
                              <option value="">Seleccione un nivel</option>
                              <option value="iniciacion">Iniciación</option>
                              <option value="paseo">Paseo</option>
                              <option value="intermedio">Intermedio</option>
                              <option value="avanzado">Avanzado</option>
                            </select>
                          </td>
                          <td style={{ fontWeight: "600", color: "var(--primary-brown)" }}>${formatCurrency(member.monthlyFee)}</td>
                          <td>{formatDate(member.lastPaymentDate)}</td>
                          <td
                            style={{
                              color: expired ? "#8b5a2b" : "var(--charcoal)",
                              fontWeight: expired ? "600" : "500",
                            }}
                          >
                            {formatDate(member.proximaFecha) || "-"}
                          </td>
                          <td>
                            <button
                              className="btn history-btn"
                              onClick={() => openPaymentHistoryModal(member)}
                              type="button"
                              style={{
                                background: "linear-gradient(135deg, var(--terracotta), var(--primary-brown))",
                                color: "white",
                                border: "none",
                                position: "relative",
                              }}
                            >
                              <History size={16} /> Historial
                              {paymentCounts[member.id] && paymentCounts[member.id] > 0 && (
                                <span className="payment-badge">
                                  {paymentCounts[member.id]}
                                </span>
                              )}
                              {/* Alerta de pago vencido o próximo a vencer */}
                              {(() => {
                                const alert = getPaymentAlert(member.id)
                                return alert ? (
                                  <span 
                                    className={alert.className}
                                    title={alert.title}
                                  >
                                    {alert.icon}
                                    <span className="alert-text">{alert.text}</span>
                                  </span>
                                ) : null
                              })()}
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Paginación */}
          {!loading && filteredMembers.length > itemsPerPage && (
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "1rem",
              marginTop: "2rem",
              padding: "1rem"
            }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "0.5rem 1rem",
                  border: "2px solid var(--terracotta)",
                  borderRadius: "8px",
                  background: currentPage === 1 ? "#f5f5f5" : "white",
                  color: currentPage === 1 ? "#999" : "var(--terracotta)",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontWeight: "600",
                  transition: "all 0.2s ease"
                }}
              >
                <ChevronLeft size={18} />
                Anterior
              </button>
              
              <div style={{
                display: "flex",
                gap: "0.5rem",
                alignItems: "center"
              }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      padding: "0.5rem 0.75rem",
                      border: currentPage === page ? "2px solid var(--terracotta)" : "2px solid #ddd",
                      borderRadius: "6px",
                      background: currentPage === page ? "var(--terracotta)" : "white",
                      color: currentPage === page ? "white" : "var(--primary-brown)",
                      cursor: "pointer",
                      fontWeight: currentPage === page ? "700" : "500",
                      minWidth: "40px",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: "0.5rem 1rem",
                  border: "2px solid var(--terracotta)",
                  borderRadius: "8px",
                  background: currentPage === totalPages ? "#f5f5f5" : "white",
                  color: currentPage === totalPages ? "#999" : "var(--terracotta)",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontWeight: "600",
                  transition: "all 0.2s ease"
                }}
              >
                Siguiente
                <ChevronRight size={18} />
              </button>

              <div style={{
                marginLeft: "1rem",
                color: "var(--stone-gray)",
                fontSize: "0.9rem"
              }}>
                Mostrando {startIndex + 1} - {Math.min(endIndex, filteredMembers.length)} de {filteredMembers.length}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO DE CABALLOS */}
      {activeTab === "caballos" && (
        <div style={{ marginTop: "2rem" }}>
          <CaballosAdmin />
        </div>
      )}

      {/* CONTENIDO DE INSTRUCTORAS */}
      {activeTab === "instructoras" && (
        <div style={{ marginTop: "2rem" }}>
          <InstructorasAdmin />
        </div>
      )}

      {/* CONTENIDO DE RESERVAS */}
      {activeTab === "reservas" && (
        <div style={{ marginTop: "2rem" }}>
          <ReservasAdmin />
        </div>
      )}

      {/* CONTENIDO DE HORARIOS PERSONALIZADOS */}
      {activeTab === "horariosPersonalizados" && (
        <div style={{ marginTop: "2rem" }}>
          <HorariosPersonalizadosAdmin />
        </div>
      )}

      {/* MODAL EDITAR (Portal) */}
      {modalOpen &&
        selectedMember &&
        renderPortal(
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{selectedMember.name}</h2>
              <div className="modal-field">
                <label>Monto Mensualidad:</label>
                <input
                  type="number"
                  value={selectedMember.monthlyFee === 0 ? "" : selectedMember.monthlyFee}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedMember({
                      ...selectedMember,
                      monthlyFee: val === "" ? "" : Number.parseFloat(val)
                    });
                  }}
                  ref={editFirstInputRef}
                  autoComplete="off"
                  inputMode="decimal"
                  data-lpignore="true"
                  data-form-type="other"
                />
              </div>
              <div className="modal-field">
                <label>Último Pago:</label>
                <input
                  type="date"
                  value={formatDate(selectedMember.lastPaymentDate)}
                  onChange={(e) => setSelectedMember({ ...selectedMember, lastPaymentDate: e.target.value })}
                  autoComplete="off"
                  data-lpignore="true"
                  data-form-type="other"
                />
              </div>
              <div className="modal-field">
                <label>Próximo Pago:</label>
                <input
                  type="date"
                  value={formatDate(selectedMember.paymentDate)}
                  onChange={(e) => setSelectedMember({ ...selectedMember, paymentDate: e.target.value })}
                  autoComplete="off"
                  data-lpignore="true"
                  data-form-type="other"
                />
              </div>
              <div className="modal-actions">
                <button className="btn" onClick={saveMemberChanges} type="button">
                  <CheckCircle size={16} /> Guardar
                </button>
                <button className="btn" onClick={closeModal} type="button">
                  Cerrar
                </button>
              </div>
            </div>
          </div>,
        )}

      {/* MODAL AGREGAR CLIENTE (Portal) */}
      {addClientModalOpen &&
        renderPortal(
          <div className="modal-overlay" onClick={closeAddClientModal}>
            <div className="modal-content add-client-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px", maxHeight: "90vh", overflowY: "auto" }}>
              <h2>Agregar Nuevo Cliente</h2>
              
              {/* Información sobre credenciales */}
              <div style={{
                background: "rgba(139, 111, 78, 0.1)",
                border: "1px solid rgba(139, 111, 78, 0.3)",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "20px",
                fontSize: "14px",
                color: "#8b6f4e",
              }}>
                🔑 <strong>Credenciales automáticas:</strong> Las credenciales se generan automáticamente. Puedes elegir enviarlas por email o copiarlas para entregarlas manualmente.
              </div>

              <div className="modal-section">
                <h3>Información Personal</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                  <div className="modal-field">
                    <label>Nombre *:</label>
                    <input
                      type="text"
                      value={newClient.nombre}
                      onChange={(e) => setNewClient({ ...newClient, nombre: e.target.value })}
                      placeholder="Ingresa el nombre"
                      ref={addFirstInputRef}
                      autoComplete="off"
                      name="newclient-name"
                    />
                  </div>
                  <div className="modal-field">
                    <label>Apellido *:</label>
                    <input
                      type="text"
                      value={newClient.apellido}
                      onChange={(e) => setNewClient({ ...newClient, apellido: e.target.value })}
                      placeholder="Ingresa el apellido"
                      autoComplete="off"
                      name="newclient-lastname"
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                  <div className="modal-field">
                    <label>Edad:</label>
                    <input
                      type="number"
                      value={newClient.edad || ""}
                      onChange={(e) => setNewClient({ ...newClient, edad: e.target.value })}
                      placeholder="Ej: 25"
                      min="0"
                      autoComplete="off"
                      name="newclient-age"
                    />
                  </div>
                  <div className="modal-field">
                    <label>Teléfono:</label>
                    <input
                      type="text"
                      value={newClient.telefono || ""}
                      onChange={(e) => setNewClient({ ...newClient, telefono: e.target.value })}
                      placeholder="Ej: 999123456"
                      autoComplete="off"
                      name="newclient-phone"
                    />
                  </div>
                  <div className="modal-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{color: withoutEmail ? '#999' : 'inherit'}}>
                      Email {!withoutEmail && '*'}:
                    </label>
                    <input
                      type="email"
                      value={withoutEmail ? '' : newClient.email}
                      onChange={(e) => !withoutEmail && setNewClient({ ...newClient, email: e.target.value })}
                      placeholder={withoutEmail ? "Email deshabilitado" : "ejemplo@email.com"}
                      autoComplete="off"
                      name="newclient-email"
                      disabled={withoutEmail}
                      style={{
                        backgroundColor: withoutEmail ? '#f5f5f5' : 'white',
                        color: withoutEmail ? '#999' : 'inherit',
                        cursor: withoutEmail ? 'not-allowed' : 'text'
                      }}
                    />
                    <label style={{
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      cursor: 'pointer', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#495057',
                      marginTop: '4px'
                    }} onClick={() => setWithoutEmail(!withoutEmail)}>
                      <input
                        type="checkbox"
                        checked={withoutEmail}
                        onChange={(e) => {
                          setWithoutEmail(e.target.checked);
                          if (!e.target.checked) {
                            setPreviewCredentials({ username: "", password: "" });
                            setPreviewEdited(false);
                          }
                        }}
                        style={{width: '16px', height: '16px'}}
                      />
                      Usuario sin correo electrónico
                    </label>
                    {withoutEmail && (
                      <div style={{fontSize: '12px', color: '#666', marginTop: '4px'}}>
                        Las credenciales se mostrarán para distribución manual
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                  <div className="modal-field">
                    <label>Tipo de Cliente:</label>
                    <select
                      value={newClient.tipo_cliente || ""}
                      onChange={(e) => setNewClient({ ...newClient, tipo_cliente: e.target.value })}
                      name="newclient-tipo-cliente"
                    >
                      <option value="">Seleccione un tipo</option>
                      <option value="general">General</option>
                      <option value="propietario">Propietario</option>
                      <option value="demo">Demo</option>
                      <option value="renta">Renta</option>
                      <option value="media_renta">Media Renta</option>
                    </select>
                  </div>
                  <div className="modal-field">
                    <label>Tipo de Nivel:</label>
                    <select
                      value={newClient.tipo_nivel || ""}
                      onChange={(e) => setNewClient({ ...newClient, tipo_nivel: e.target.value })}
                      name="newclient-tipo-nivel"
                    >
                      <option value="">Seleccione un nivel</option>
                      <option value="iniciacion">Iniciación</option>
                      <option value="paseo">Paseo</option>
                      <option value="intermedio">Intermedio</option>
                      <option value="avanzado">Avanzado</option>
                    </select>
                  </div>
                </div>
                <div className="modal-field">
                  <label>Estatus:</label>
                  <select
                    value={newClient.estatus || "activo"}
                    onChange={(e) => setNewClient({ ...newClient, estatus: e.target.value })}
                    name="newclient-estatus"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="bloqueado">Bloqueado</option>
                  </select>
                </div>
              </div>

              {/* Vista previa de credenciales (solo si es sin email) */}
              {withoutEmail && previewCredentials.username && (
                <div className="modal-section" style={{
                  background: userCreatedSuccessfully ? '#d4edda' : '#fff3cd', 
                  border: `1px solid ${userCreatedSuccessfully ? '#c3e6cb' : '#ffeaa7'}`, 
                  borderRadius: '6px', 
                  padding: '15px', 
                  marginBottom: '15px'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                    <h4 style={{margin: 0, color: userCreatedSuccessfully ? '#155724' : '#856404', fontSize: '14px'}}>
                      {userCreatedSuccessfully ? '🎉 ¡Usuario creado exitosamente!' : '⚠️ Credenciales a crear:'}
                    </h4>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const realCreds = await getRealCredentials(
                            newClient.nombre, 
                            newClient.apellido, 
                            previewCredentials.password
                          );
                          const credentialsText = `Username: ${realCreds?.username || previewCredentials.username}\nContraseña: ${realCreds?.password || previewCredentials.password}`;
                          
                          // Intentar usar Clipboard API moderno
                          if (navigator.clipboard && navigator.clipboard.writeText) {
                            try {
                              await navigator.clipboard.writeText(credentialsText);
                              setCopyMessage("Credenciales copiadas");
                            } catch (clipboardError) {
                              // Fallback a método alternativo si Clipboard API falla
                              await fallbackCopyTextToClipboard(credentialsText);
                              setCopyMessage("Credenciales copiadas");
                            }
                          } else {
                            // Fallback para navegadores que no soportan Clipboard API
                            await fallbackCopyTextToClipboard(credentialsText);
                            setCopyMessage("Credenciales copiadas");
                          }
                          setTimeout(() => setCopyMessage(""), 2000);
                        } catch (error) {
                          console.error("Error al copiar credenciales:", error);
                          setCopyMessage("Error al copiar");
                          setTimeout(() => setCopyMessage(""), 2000);
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: userCreatedSuccessfully ? '#28a745' : '#f0ad4e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Copiar ambas credenciales"
                    >
                      📋 Copiar todo
                    </button>
                  </div>
                  
                  {copyMessage && (
                    <div style={{
                      background: '#d4edda',
                      color: '#155724',
                      border: '1px solid #c3e6cb',
                      borderRadius: '4px',
                      padding: '8px',
                      marginBottom: '10px',
                      fontSize: '12px',
                      textAlign: 'center'
                    }}>
                      ✅ {copyMessage}
                    </div>
                  )}

                  {!userCreatedSuccessfully && (
                    <div style={{
                      background: '#fcf8e3',
                      color: '#8a6d3b',
                      border: '1px solid #faebcc',
                      borderRadius: '4px',
                      padding: '10px',
                      marginBottom: '12px',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      💡 <strong>RECOMENDACIÓN:</strong> Copia estas credenciales ANTES de crear la cuenta. Una vez creada, el modal se cerrará automáticamente.
                    </div>
                  )}
                  
                  <div style={{marginBottom: '10px'}}>
                    <label style={{fontSize: '12px', color: '#6c757d', fontWeight: 'bold'}}>Username:</label>
                    <div style={{
                      background: 'white', 
                      border: '1px solid #ced4da', 
                      borderRadius: '4px', 
                      padding: '8px', 
                      fontFamily: 'monospace', 
                      fontSize: '14px'
                    }}>
                      {previewCredentials.username}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{fontSize: '12px', color: '#6c757d', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px'}}>
                      Contraseña:
                      {!userCreatedSuccessfully && (
                        <span style={{fontSize: '11px', color: '#8b6f4e', fontWeight: 'normal'}}>✏️ (editable)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={previewCredentials.password}
                      onChange={(e) => {
                        if (!userCreatedSuccessfully) {
                          setPreviewCredentials({...previewCredentials, password: e.target.value});
                          setPreviewEdited(true);
                        }
                      }}
                      disabled={userCreatedSuccessfully}
                      style={{
                        width: '100%',
                        border: `2px solid ${
                          userCreatedSuccessfully 
                            ? '#28a745' 
                            : previewCredentials.password.length > 0 && previewCredentials.password.length < 8
                              ? '#dc3545'
                              : '#8b6f4e'
                        }`, 
                        borderRadius: '4px', 
                        padding: '8px', 
                        fontFamily: 'monospace', 
                        fontSize: '14px',
                        backgroundColor: userCreatedSuccessfully ? '#f8fff9' : '#fafafa',
                        cursor: userCreatedSuccessfully ? 'default' : 'text'
                      }}
                      placeholder={userCreatedSuccessfully ? "Contraseña final" : "Mínimo 8 caracteres"}
                    />
                    {!userCreatedSuccessfully && previewCredentials.password.length > 0 && previewCredentials.password.length < 8 && (
                      <div style={{ fontSize: '11px', color: '#dc3545', marginTop: '4px', fontWeight: '500' }}>
                        ⚠️ Contraseña muy corta ({previewCredentials.password.length}/8 caracteres)
                      </div>
                    )}
                    {!userCreatedSuccessfully && previewCredentials.password.length >= 8 && (
                      <div style={{ fontSize: '11px', color: '#28a745', marginTop: '4px', fontWeight: '500' }}>
                        ✓ Contraseña válida ({previewCredentials.password.length} caracteres)
                      </div>
                    )}
                  </div>
                  
                  <p style={{color:'#b05a00',fontWeight:600, marginTop: '12px', marginBottom:0, fontSize: '13px'}}>
                    <span style={{display:'flex',alignItems:'center'}}>
                      <span role="img" aria-label="candado" style={{marginRight:4}}>🔒</span>
                      Estas credenciales <b>NO</b> se enviarán por correo.
                    </span>
                    <span style={{fontWeight:400, fontSize:'1em', marginLeft:24, display:'block', marginTop:2}}>
                      Debes copiarlas y entregarlas personalmente.
                    </span>
                  </p>
                </div>
              )}

              <div className="modal-section">
                <h3>Información de Pagos</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                  <div className="modal-field">
                    <label>Monto Mensualidad *:</label>
                    <input
                      type="text"
                      value={newClient.monto === "" ? "" : formatNumberInput(newClient.monto)}
                      onChange={(e) => {
                        const val = e.target.value;
                        const parsed = parseFormattedNumber(val);
                        setNewClient({
                          ...newClient,
                          monto: parsed === "" ? "" : parsed
                        });
                      }}
                      placeholder="Ej: 18,000.00"
                      autoComplete="off"
                      inputMode="decimal"
                      data-lpignore="true"
                      data-form-type="other"
                    />
                  </div>
                  <div className="modal-field">
                    <label>Fecha de Pago *:</label>
                    <input
                      type="date"
                      value={newClient.fecha_pago}
                      onChange={(e) => setNewClient({ ...newClient, fecha_pago: e.target.value })}
                      autoComplete="off"
                      data-lpignore="true"
                      data-form-type="other"
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                  <div className="modal-field">
                    <label>Concepto *:</label>
                    <input
                      type="text"
                      value={newClient.concepto}
                      onChange={(e) => setNewClient({ ...newClient, concepto: e.target.value })}
                      placeholder="Ej: Mensualidad, Pago inicial, etc."
                      autoComplete="off"
                      data-lpignore="true"
                      data-form-type="other"
                    />
                  </div>
                  <div className="modal-field">
                    <label>Estado del Pago *:</label>
                    <select
                      value={newClient.estatus_pago}
                      onChange={(e) => setNewClient({ ...newClient, estatus_pago: e.target.value })}
                      className="status-filter"
                      data-lpignore="true"
                      data-form-type="other"
                    >
                      <option value="pagado">Pagado</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="vencido">Vencido</option>
                      <option value="bloqueado">Bloqueado</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                  <div className="modal-field">
                    <label>Método de Pago *:</label>
                    <select
                      value={newClient.metodo_pago}
                      onChange={(e) => setNewClient({ ...newClient, metodo_pago: e.target.value })}
                      className="status-filter"
                      data-lpignore="true"
                      data-form-type="other"
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="link_pago">Link de Pago</option>
                    </select>
                  </div>
                  <div className="modal-field">
                    <label>Observaciones:</label>
                    <textarea
                      value={newClient.observaciones}
                      onChange={(e) => setNewClient({ ...newClient, observaciones: e.target.value })}
                      placeholder="Observaciones adicionales (opcional)"
                      rows="3"
                      autoComplete="off"
                      data-lpignore="true"
                      data-form-type="other"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-primary" onClick={createNewClient} type="button" disabled={creatingClient}>
                  {creatingClient ? (
                    <>
                      <Loader size={16} className="spin" /> Verificando credenciales y registrando...
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} /> Crear Cliente
                    </>
                  )}
                </button>
                <button className="btn btn-secondary" onClick={closeAddClientModal} type="button">
                  Cancelar
                </button>
              </div>
            </div>
          </div>,
        )}

      {/* MODAL HISTORIAL DE PAGOS (Portal) */}
      {paymentHistoryModalOpen &&
        selectedMember &&
        renderPortal(
          <div className="modal-overlay" onClick={closePaymentHistoryModal}>
            <div className="modal-content payment-history-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Historial de Pagos - {selectedMember.name}</h2>

              {/* Historial de pagos existentes */}
              <div className="modal-section">
                <h3>Pagos Realizados</h3>
                {paymentHistory.length === 0 ? (
                  <p style={{ color: "var(--stone-gray)", fontStyle: "italic" }}>
                    No hay pagos registrados
                  </p>
                ) : (
                  <div className="payment-history-list">
                    {paymentHistory.map((payment, index) => (
                      <div key={index} className="payment-item">
                        <div className="payment-info">
                          <div className="payment-amount">${formatCurrency(payment.monto)}</div>
                          <div className="payment-concept">Concepto: {payment.concepto || "N/A"}</div>
                          <div className="payment-status">Estado: {payment.estatus_pago || "N/A"}</div>
                          <div className="payment-method">Método de Pago: {payment.metodo_pago ? (payment.metodo_pago === 'link_pago' ? 'Link de Pago' : payment.metodo_pago.charAt(0).toUpperCase() + payment.metodo_pago.slice(1)) : "N/A"}</div>
                          <div className="payment-dates">
                            <span>Fecha de Pago: {formatDate(payment.fecha_pago)}</span>
                          </div>
                          {payment.observaciones && (
                            <div className="payment-observations">Observaciones: {payment.observaciones}</div>
                          )}
                        </div>
                        <button
                          type="button"
                          className="edit-payment-btn"
                          onClick={() => openEditPaymentModal(payment)}
                          title="Editar pago"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Formulario para agregar nuevo pago */}
              <div className="modal-section">
                <h3>Agregar Nuevo Pago</h3>
                <div className="modal-field">
                  <label>Monto *:</label>
                  <input
                    type="text"
                    value={newPayment.monto === "" || newPayment.monto === 0 ? "" : formatNumberInput(newPayment.monto)}
                    onChange={(e) => {
                      const val = e.target.value;
                      const parsed = parseFormattedNumber(val);
                      setNewPayment({
                        ...newPayment,
                        monto: parsed === "" ? "" : parsed
                      });
                    }}
                    placeholder="Ej: 18,000.00"
                    autoComplete="off"
                    inputMode="decimal"
                    data-lpignore="true"
                    data-form-type="other"
                  />
                </div>
                <div className="modal-field">
                  <label>Fecha de Pago *:</label>
                  <input
                    type="date"
                    value={newPayment.fecha_pago}
                    onChange={(e) => setNewPayment({ ...newPayment, fecha_pago: e.target.value })}
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                  />
                </div>
                <div className="modal-field">
                  <label>Concepto *:</label>
                  <input
                    type="text"
                    value={newPayment.concepto}
                    onChange={(e) => setNewPayment({ ...newPayment, concepto: e.target.value })}
                    placeholder="Ej: Mensualidad, Pago inicial, etc."
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                  <div className="modal-field">
                    <label>Estado del Pago *:</label>
                    <select
                      value={newPayment.estatus_pago}
                      onChange={(e) => setNewPayment({ ...newPayment, estatus_pago: e.target.value })}
                      className="status-filter"
                      data-lpignore="true"
                      data-form-type="other"
                    >
                      <option value="pagado">Pagado</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="vencido">Vencido</option>
                      <option value="bloqueado">Bloqueado</option>
                    </select>
                  </div>
                  <div className="modal-field">
                    <label>Método de Pago *:</label>
                    <select
                      value={newPayment.metodo_pago}
                      onChange={(e) => setNewPayment({ ...newPayment, metodo_pago: e.target.value })}
                      className="status-filter"
                      data-lpignore="true"
                      data-form-type="other"
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="link_pago">Link de Pago</option>
                    </select>
                  </div>
                </div>
                <div className="modal-field">
                  <label>Observaciones:</label>
                  <textarea
                    value={newPayment.observaciones}
                    onChange={(e) => setNewPayment({ ...newPayment, observaciones: e.target.value })}
                    placeholder="Observaciones adicionales (opcional)"
                    rows="3"
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-primary" onClick={addNewPayment} type="button">
                  <CheckCircle size={16} /> Agregar Pago
                </button>
                <button className="btn btn-secondary" onClick={closePaymentHistoryModal} type="button">
                  Cerrar
                </button>
              </div>
            </div>
          </div>,
        )}

      {/* MODAL DE EDICIÓN DE PAGO (Portal) */}
      {editPaymentModalOpen &&
        renderPortal(
          <div className="modal-overlay" onClick={closeEditPaymentModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Editar Pago</h2>
                <button className="modal-close" onClick={closeEditPaymentModal}>
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="modal-content">
                <div className="modal-field">
                  <label>Monto *:</label>
                  <input
                    type="text"
                    value={editingPayment?.monto ? formatNumberInput(editingPayment.monto) : ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      const parsed = parseFormattedNumber(val);
                      setEditingPayment({...editingPayment, monto: parsed === "" ? "" : parsed});
                    }}
                    placeholder="Ej: 18,000.00"
                  />
                </div>

                <div className="modal-field">
                  <label>Fecha de Pago *:</label>
                  <input
                    type="date"
                    value={editingPayment?.fecha_pago || ""}
                    onChange={(e) => setEditingPayment({...editingPayment, fecha_pago: e.target.value})}
                  />
                </div>

                <div className="modal-field">
                  <label>Concepto *:</label>
                  <input
                    type="text"
                    value={editingPayment?.concepto || ""}
                    onChange={(e) => setEditingPayment({...editingPayment, concepto: e.target.value})}
                    placeholder="Ej: Mensualidad, Pago inicial, etc."
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                  <div className="modal-field">
                    <label>Estado del Pago *:</label>
                    <select
                      value={editingPayment?.estatus_pago || "pagado"}
                      onChange={(e) => setEditingPayment({...editingPayment, estatus_pago: e.target.value})}
                    >
                      <option value="pagado">Pagado</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="vencido">Vencido</option>
                      <option value="bloqueado">Bloqueado</option>
                    </select>
                  </div>
                  <div className="modal-field">
                    <label>Método de Pago *:</label>
                    <select
                      value={editingPayment?.metodo_pago || "efectivo"}
                      onChange={(e) => setEditingPayment({...editingPayment, metodo_pago: e.target.value})}
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="link_pago">Link de Pago</option>
                    </select>
                  </div>
                </div>

                <div className="modal-field">
                  <label>Observaciones:</label>
                  <textarea
                    value={editingPayment?.observaciones || ""}
                    onChange={(e) => setEditingPayment({...editingPayment, observaciones: e.target.value})}
                    placeholder="Observaciones adicionales (opcional)"
                    rows="3"
                  />
                </div>

                {/* Botones integrados dentro del contenido */}
                <div className="modal-buttons">
                  <button 
                    className="btn cancel-btn" 
                    onClick={closeEditPaymentModal}
                    type="button"
                  >
                    Cancelar
                  </button>
                  <button 
                    className="btn submit-btn" 
                    onClick={updatePayment}
                    type="button"
                  >
                    Actualizar Pago
                  </button>
                </div>
              </div>
            </div>
          </div>,
        )}

      {/* NOTIFICACIÓN (Portal) */}
      {notification.show &&
        renderPortal(
          <div className={`notification ${notification.type}`}>
            <div className="notification-content">
              <span className="notification-message">{notification.message}</span>
              <button 
                className="notification-close" 
                onClick={() => setNotification({ show: false, message: "", type: "" })}
              >
                ×
              </button>
            </div>
          </div>
        )}
    </div>
  )
}

export default MembershipAdminDashboard
