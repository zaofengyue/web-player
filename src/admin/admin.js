(function(){
  const loginView = document.getElementById('loginView');
  const panelView = document.getElementById('panelView');
  const passwordInput = document.getElementById('passwordInput');
  const loginBtn = document.getElementById('loginBtn');
  const loginStatus = document.getElementById('loginStatus');
  const logoutBtn = document.getElementById('logoutBtn');
  const nameInput = document.getElementById('nameInput');
  const rawInput = document.getElementById('rawInput');
  const submitBtn = document.getElementById('submitBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const formTitle = document.getElementById('formTitle');
  const formStatus = document.getElementById('formStatus');
  const sourceList = document.getElementById('sourceList');
  const sourceCount = document.getElementById('sourceCount');

  let editingId = null;

  function setFormStatus(text, mode){
    formStatus.textContent = text || '';
    formStatus.className = 'status' + (mode ? ' ' + mode : '');
  }

  function setLoginStatus(text, mode){
    loginStatus.textContent = text || '';
    loginStatus.className = 'status' + (mode ? ' ' + mode : '');
  }

  function resetForm(){
    editingId = null;
    nameInput.value = '';
    rawInput.value = '';
    formTitle.textContent = '添加源';
    submitBtn.textContent = '保存';
    cancelEditBtn.style.display = 'none';
  }

  async function loadSources(){
    sourceList.innerHTML = '<div class="empty-tip">加载中...</div>';
    try {
      const res = await fetch('/api/admin/sources');
      if (res.status === 401) { showLogin(); return; }
      const list = await res.json();
      sourceCount.textContent = '(' + list.length + ')';
      if (!list.length) {
        sourceList.innerHTML = '<div class="empty-tip">暂无源，在上方添加</div>';
        return;
      }
      sourceList.innerHTML = '';
      list.forEach(function(src){
        const item = document.createElement('div');
        item.className = 'source-item';
        const info = document.createElement('div');
        info.style.flex = '1';
        info.style.minWidth = '0';
        const name = document.createElement('div');
        name.className = 'name';
        name.textContent = src.name;
        const preview = document.createElement('div');
        preview.className = 'raw-preview';
        preview.textContent = src.raw;
        info.appendChild(name);
        info.appendChild(preview);
        const btns = document.createElement('div');
        btns.className = 'btns';
        const editBtn = document.createElement('button');
        editBtn.className = 'btn-ghost';
        editBtn.textContent = '编辑';
        editBtn.addEventListener('click', function(){
          editingId = src.id;
          nameInput.value = src.name;
          rawInput.value = src.raw;
          formTitle.textContent = '编辑源';
          submitBtn.textContent = '保存修改';
          cancelEditBtn.style.display = '';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        const delBtn = document.createElement('button');
        delBtn.className = 'btn-danger';
        delBtn.textContent = '删除';
        delBtn.addEventListener('click', async function(){
          if (!window.confirm('确定删除源「' + src.name + '」？')) return;
          try {
            const res = await fetch('/api/admin/sources?id=' + encodeURIComponent(src.id), { method: 'DELETE' });
            if (!res.ok) throw new Error('删除失败');
            loadSources();
          } catch(e) {
            window.alert('删除失败: ' + e.message);
          }
        });
        btns.appendChild(editBtn);
        btns.appendChild(delBtn);
        item.appendChild(info);
        item.appendChild(btns);
        sourceList.appendChild(item);
      });
    } catch(e) {
      sourceList.innerHTML = '<div class="empty-tip">加载失败: ' + e.message + '</div>';
    }
  }

  submitBtn.addEventListener('click', async function(){
    const name = nameInput.value.trim();
    const raw = rawInput.value.trim();
    if (!raw) { setFormStatus('请输入源内容', 'err'); return; }
    setFormStatus('保存中...', '');
    try {
      let res;
      if (editingId) {
        res = await fetch('/api/admin/sources', {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id: editingId, name: name, raw: raw })
        });
      } else {
        res = await fetch('/api/admin/sources', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ name: name, raw: raw })
        });
      }
      if (res.status === 401) { showLogin(); return; }
      if (!res.ok) {
        const err = await res.json().catch(function(){ return {}; });
        throw new Error(err.error || '保存失败');
      }
      setFormStatus(editingId ? '已更新' : '已添加', 'ok');
      resetForm();
      loadSources();
    } catch(e) {
      setFormStatus('保存失败: ' + e.message, 'err');
    }
  });

  cancelEditBtn.addEventListener('click', resetForm);

  async function doLogin(){
    const password = passwordInput.value;
    if (!password) { setLoginStatus('请输入密码', 'err'); return; }
    setLoginStatus('登录中...', '');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password: password })
      });
      if (!res.ok) {
        const err = await res.json().catch(function(){ return {}; });
        throw new Error(err.error || '登录失败');
      }
      passwordInput.value = '';
      showPanel();
    } catch(e) {
      setLoginStatus(e.message, 'err');
    }
  }

  loginBtn.addEventListener('click', doLogin);
  passwordInput.addEventListener('keydown', function(e){
    if (e.key === 'Enter') doLogin();
  });

  logoutBtn.addEventListener('click', async function(){
    try { await fetch('/api/admin/logout', { method: 'POST' }); } catch(e) {}
    showLogin();
  });

  function showLogin(){
    loginView.style.display = '';
    panelView.style.display = 'none';
  }

  function showPanel(){
    loginView.style.display = 'none';
    panelView.style.display = '';
    resetForm();
    loadSources();
  }

  (async function init(){
    try {
      const res = await fetch('/api/admin/check');
      const data = await res.json();
      if (data.ok) showPanel(); else showLogin();
    } catch(e) {
      showLogin();
    }
  })();
})();
